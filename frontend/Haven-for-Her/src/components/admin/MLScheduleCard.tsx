import { useEffect, useState } from 'react'
import { Calendar, Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { getMLSchedule, updateMLSchedule, type MLRetrainSchedule } from '@/api/mlApi'

export function MLScheduleCard() {
  const [schedule, setSchedule] = useState<MLRetrainSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getMLSchedule()
      .then(setSchedule)
      .catch(() => setError('Failed to load schedule. Ensure backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!schedule) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateMLSchedule(schedule)
      setSchedule(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to save schedule settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse h-48 bg-muted rounded-2xl" />
  if (!schedule) return null

  return (
    <Card className="shadow-bloom border-border overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="text-primary size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Auto-Retrain Schedule</CardTitle>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                Automated Pipeline Maintenance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
            <Label htmlFor="enabled" className="text-xs font-bold uppercase cursor-pointer select-none">
              {schedule.isEnabled ? 'Active' : 'Paused'}
            </Label>
            <Checkbox 
              id="enabled"
              checked={schedule.isEnabled}
              onCheckedChange={(checked) => setSchedule(prev => prev ? { ...prev, isEnabled: !!checked } : null)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Frequency</Label>
            <Select 
              value={schedule.frequency} 
              onValueChange={(v) => setSchedule(prev => prev ? { ...prev, frequency: v as any } : null)}
            >
              <SelectTrigger className="h-10 bg-background/50">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Execution Time (UTC)</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  type="number" 
                  min={0} max={23} 
                  className="h-10 pl-8 bg-background/50" 
                  value={schedule.hour} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setSchedule(prev => prev ? { ...prev, hour: val } : null)
                  }}
                />
                <Clock className="absolute left-2.5 top-3 size-4 text-muted-foreground/40" />
                <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-muted-foreground/60">HR</span>
              </div>
              <span className="text-muted-foreground font-bold">:</span>
              <div className="relative flex-1">
                <Input 
                  type="number" 
                  min={0} max={59} 
                  className="h-10 pr-9 bg-background/50" 
                  value={schedule.minute} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setSchedule(prev => prev ? { ...prev, minute: val } : null)
                  }}
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-muted-foreground/60">MIN</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {schedule.frequency === 'Weekly' && (
               <>
                 <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Day of Week</Label>
                 <Select 
                   value={String(schedule.dayOfWeek ?? 0)} 
                   onValueChange={(v) => setSchedule(prev => prev ? { ...prev, dayOfWeek: parseInt(v || '0') } : null)}
                 >
                   <SelectTrigger className="h-10 bg-background/50">
                     <SelectValue placeholder="Select day" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="0">Sunday</SelectItem>
                     <SelectItem value="1">Monday</SelectItem>
                     <SelectItem value="2">Tuesday</SelectItem>
                     <SelectItem value="3">Wednesday</SelectItem>
                     <SelectItem value="4">Thursday</SelectItem>
                     <SelectItem value="5">Friday</SelectItem>
                     <SelectItem value="6">Saturday</SelectItem>
                   </SelectContent>
                 </Select>
               </>
            )}

            {schedule.frequency === 'Monthly' && (
               <>
                 <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Day of Month</Label>
                 <div className="relative">
                   <Input 
                     type="number" 
                     min={1} max={31} 
                     className="h-10 pr-9 bg-background/50" 
                     value={schedule.dayOfMonth ?? 1} 
                     onChange={(e) => {
                       const val = parseInt(e.target.value) || 1
                       setSchedule(prev => prev ? { ...prev, dayOfMonth: val } : null)
                     }}
                   />
                   <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-muted-foreground/60">DAY</span>
                 </div>
               </>
            )}
            
            {(schedule.frequency === 'Daily') && (
              <div className="flex h-full items-end justify-end">
                 <p className="text-[10px] text-muted-foreground italic mb-2">Runs every day at the selected time.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/50">
           <div className="flex flex-wrap gap-x-6 gap-y-2">
             {schedule.lastRun && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight mb-0.5">Last Run</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-card-foreground">
                      {new Date(schedule.lastRun || '').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${schedule.lastRunStatus?.includes('Success') ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {schedule.lastRunStatus}
                    </span>
                  </div>
                </div>
              )}
              {schedule.isEnabled && schedule.nextRun && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight mb-0.5">Next Run</p>
                  <p className="text-xs font-bold text-primary">
                    {new Date(schedule.nextRun || '').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              )}
           </div>

           <div className="flex items-center gap-3">
             {success && (
               <div className="flex items-center gap-1.5 text-primary animate-in fade-in slide-in-from-right-2">
                 <CheckCircle2 className="size-4" />
                 <span className="text-xs font-bold uppercase">Saved</span>
               </div>
             )}
             <Button 
               size="sm" 
               className="gap-2 px-6 shadow-bloom" 
               disabled={saving}
               onClick={handleSave}
             >
               <Save className="size-3.5" />
               {saving ? 'Saving...' : 'Save Settings'}
             </Button>
           </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-xl flex items-center gap-2.5 animate-in fade-in zoom-in-95">
            <AlertCircle className="size-4 shrink-0" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
