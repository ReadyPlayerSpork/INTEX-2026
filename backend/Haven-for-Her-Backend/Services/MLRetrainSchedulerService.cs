using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Services;

/// <summary>
/// Background service that periodically checks the database for scheduled ML retraining tasks.
/// If a schedule is active and due, it triggers the ML microservice.
/// </summary>
public class MLRetrainSchedulerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MLRetrainSchedulerService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public MLRetrainSchedulerService(IServiceProvider serviceProvider, ILogger<MLRetrainSchedulerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ML Retrain Scheduler Service is starting.");

        // Wait a bit after startup to let the migrations run and systems settle
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndTriggerRetrainAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking ML retrain schedule.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("ML Retrain Scheduler Service is stopping.");
    }

    private async Task CheckAndTriggerRetrainAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<HavenForHerBackendDbContext>();
        
        // Ensure the table exists and has a default schedule if none exists
        var schedule = await dbContext.MlRetrainSchedules.FirstOrDefaultAsync(stoppingToken);
        
        if (schedule == null)
        {
            // Create a default disabled schedule
            schedule = new MLRetrainSchedule
            {
                IsEnabled = false,
                Frequency = "Daily",
                Hour = 0,
                Minute = 0,
                NextRun = null
            };
            dbContext.MlRetrainSchedules.Add(schedule);
            await dbContext.SaveChangesAsync(stoppingToken);
            return;
        }

        if (!schedule.IsEnabled)
        {
            return;
        }

        var now = DateTime.UtcNow;

        // If NextRun is not set, calculate it
        if (schedule.NextRun == null)
        {
            schedule.NextRun = CalculateNextRun(schedule, now);
            await dbContext.SaveChangesAsync(stoppingToken);
        }

        if (now >= schedule.NextRun.Value)
        {
            _logger.LogInformation("Triggering scheduled ML retraining. Frequency: {Frequency}, Scheduled: {Scheduled}", 
                schedule.Frequency, schedule.NextRun);
            
            try 
            {
                var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
                var client = httpClientFactory.CreateClient("MlService");
                
                // Trigger retraining
                var response = await client.PostAsync("/api/ml/retrain", null, stoppingToken);
                
                schedule.LastRun = now;
                if (response.IsSuccessStatusCode)
                {
                    schedule.LastRunStatus = "Success";
                    _logger.LogInformation("Successfully triggered scheduled ML retraining.");
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync(stoppingToken);
                    schedule.LastRunStatus = $"Failed: {response.StatusCode}";
                    _logger.LogError("Failed to trigger ML retraining. Status: {Status}, Body: {Body}", 
                        response.StatusCode, error);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while triggering scheduled ML retraining.");
                schedule.LastRun = now;
                schedule.LastRunStatus = $"Error: {ex.Message}";
            }
            finally
            {
                // Always schedule the next run regardless of success/failure
                schedule.NextRun = CalculateNextRun(schedule, now);
                await dbContext.SaveChangesAsync(stoppingToken);
                _logger.LogInformation("Next scheduled retraining set for: {NextRun}", schedule.NextRun);
            }
        }
    }

    private DateTime CalculateNextRun(MLRetrainSchedule schedule, DateTime baseDate)
    {
        // Start with the scheduled time on the base date
        DateTime next = new DateTime(baseDate.Year, baseDate.Month, baseDate.Day, 
            schedule.Hour, schedule.Minute, 0, DateTimeKind.Utc);
        
        // If that time is already passed today, start projecting from the next period
        if (next <= baseDate)
        {
            if (schedule.Frequency == "Daily")
            {
                next = next.AddDays(1);
            }
            else if (schedule.Frequency == "Weekly" && schedule.DayOfWeek.HasValue)
            {
                next = next.AddDays(1);
                while (next.DayOfWeek != schedule.DayOfWeek.Value)
                {
                    next = next.AddDays(1);
                }
            }
            else if (schedule.Frequency == "Monthly" && schedule.DayOfMonth.HasValue)
            {
                next = next.AddMonths(1);
                int daysInMonth = DateTime.DaysInMonth(next.Year, next.Month);
                int targetDay = Math.Min(schedule.DayOfMonth.Value, daysInMonth);
                next = new DateTime(next.Year, next.Month, targetDay, schedule.Hour, schedule.Minute, 0, DateTimeKind.Utc);
            }
            else
            {
                next = next.AddDays(1);
            }
        }
        else
        {
            // Even if 'next' is in the future, it might not match the day requirements
            if (schedule.Frequency == "Weekly" && schedule.DayOfWeek.HasValue && next.DayOfWeek != schedule.DayOfWeek.Value)
            {
                while (next.DayOfWeek != schedule.DayOfWeek.Value)
                {
                    next = next.AddDays(1);
                }
            }
            else if (schedule.Frequency == "Monthly" && schedule.DayOfMonth.HasValue && next.Day != schedule.DayOfMonth.Value)
            {
                int daysInMonth = DateTime.DaysInMonth(next.Year, next.Month);
                int targetDay = Math.Min(schedule.DayOfMonth.Value, daysInMonth);
                next = new DateTime(next.Year, next.Month, targetDay, schedule.Hour, schedule.Minute, 0, DateTimeKind.Utc);
                
                // If adjusting to targetDay pushed it to the past, go to next month
                if (next <= baseDate)
                {
                    next = next.AddMonths(1);
                    daysInMonth = DateTime.DaysInMonth(next.Year, next.Month);
                    targetDay = Math.Min(schedule.DayOfMonth.Value, daysInMonth);
                    next = new DateTime(next.Year, next.Month, targetDay, schedule.Hour, schedule.Minute, 0, DateTimeKind.Utc);
                }
            }
        }

        return next;
    }
}
