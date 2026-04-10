import { useState, type FormEvent } from "react"

import { donationApi, getDonationErrorMessage } from "@/api/donationApi"
import {
  type DonationCurrencyCode,
  isDonationCurrencyCode,
} from "./donationCurrencies"

export function useAnonymousDonateForm() {
  const [currencyCode, setCurrencyCode] =
    useState<DonationCurrencyCode>("USD")
  const [amount, setAmount] = useState("")
  const [campaign, setCampaign] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await donationApi.submitAnonymousDonation({
        amount,
        currencyCode,
        campaignName: campaign,
        donorName,
        donorEmail,
        notes,
      })
      setSuccess(true)
    } catch (err) {
      setError(getDonationErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return {
    currencyCode,
    onCurrencyChange: (value: string) => {
      if (isDonationCurrencyCode(value)) setCurrencyCode(value)
    },
    amount,
    campaign,
    donorName,
    donorEmail,
    notes,
    loading,
    success,
    error,
    onAmountChange: setAmount,
    onCampaignChange: setCampaign,
    onDonorNameChange: setDonorName,
    onDonorEmailChange: setDonorEmail,
    onNotesChange: setNotes,
    onPresetAmount: setAmount,
    onSubmit: handleSubmit,
  }
}
