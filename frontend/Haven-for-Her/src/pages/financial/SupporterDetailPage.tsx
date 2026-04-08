import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { financialApi, type SupporterDetailDto, type RecordDonationRequest } from '@/api/financialApi'
import { Button } from '@/components/ui/button'
import { SupporterFormModal } from '@/components/financial/SupporterFormModal'
import { RecordDonationModal } from '@/components/financial/RecordDonationModal'

export function SupporterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [supporter, setSupporter] = useState<SupporterDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDonation, setShowDonation] = useState(false)

  const fetchSupporter = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await financialApi.getSupporter(Number(id))
      setSupporter(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchSupporter()
  }, [fetchSupporter])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!supporter) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-muted-foreground">Supporter not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-2 flex items-center gap-2 text-sm text-soft-purple/70">
        <Link to="/financial/donors" className="hover:text-plum underline">Donors</Link>
        <span>/</span>
        <span>{supporter.displayName}</span>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-plum">{supporter.displayName}</h1>
          <p className="text-sm text-soft-purple">
            {supporter.supporterType} &middot; {supporter.status} &middot; {supporter.relationshipType}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button size="sm" onClick={() => setShowDonation(true)}>Record Donation</Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl bg-cream p-6 md:grid-cols-3">
        {[
          { label: 'Email', value: supporter.email },
          { label: 'Phone', value: supporter.phone },
          { label: 'Organization', value: supporter.organizationName },
          { label: 'Region', value: supporter.region },
          { label: 'Country', value: supporter.country },
          { label: 'Channel', value: supporter.acquisitionChannel },
          { label: 'First Donation', value: supporter.firstDonationDate },
          { label: 'Created', value: new Date(supporter.createdAt).toLocaleDateString() },
        ].map((f) => (
          <div key={f.label}>
            <p className="text-xs font-medium uppercase text-soft-purple/70">{f.label}</p>
            <p className="text-sm text-plum">{f.value || '-'}</p>
          </div>
        ))}
      </div>

      {/* Donation History */}
      <h2 className="mb-4 font-heading text-xl font-semibold text-plum">Donation History</h2>
      {supporter.donations.length === 0 ? (
        <p className="text-sm text-soft-purple/70">No donations recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Campaign</th>
                <th className="px-3 py-2 font-medium">Channel</th>
                <th className="px-3 py-2 font-medium">Recurring</th>
                <th className="px-3 py-2 font-medium">Allocations</th>
              </tr>
            </thead>
            <tbody>
              {supporter.donations.map((d) => (
                <tr key={d.donationId} className="border-border border-b">
                  <td className="px-3 py-2">{d.donationDate}</td>
                  <td className="px-3 py-2">{d.donationType}</td>
                  <td className="px-3 py-2">
                    {d.amount != null
                      ? `${d.currencyCode ?? 'USD'} ${d.amount.toLocaleString()}`
                      : d.estimatedValue != null
                        ? `~${d.estimatedValue.toLocaleString()}`
                        : '-'}
                  </td>
                  <td className="px-3 py-2">{d.campaignName ?? '-'}</td>
                  <td className="px-3 py-2">{d.channelSource}</td>
                  <td className="px-3 py-2">{d.isRecurring ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">
                    {d.allocations.length > 0
                      ? d.allocations.map((a) => `${a.safehouseName}: ${a.amountAllocated.toLocaleString()}`).join(', ')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEdit && (
        <SupporterFormModal
          initial={{
            supporterType: supporter.supporterType,
            displayName: supporter.displayName,
            organizationName: supporter.organizationName,
            firstName: supporter.firstName,
            lastName: supporter.lastName,
            relationshipType: supporter.relationshipType,
            region: supporter.region,
            country: supporter.country,
            email: supporter.email,
            phone: supporter.phone,
            status: supporter.status,
            acquisitionChannel: supporter.acquisitionChannel,
          }}
          onSubmit={async (data) => {
            await financialApi.updateSupporter(supporter.supporterId, data)
            setShowEdit(false)
            void fetchSupporter()
          }}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDonation && (
        <RecordDonationModal
          supporterId={supporter.supporterId}
          onSubmit={async (data: RecordDonationRequest) => {
            await financialApi.recordDonation(data)
            setShowDonation(false)
            void fetchSupporter()
          }}
          onClose={() => setShowDonation(false)}
        />
      )}
    </div>
  )
}
