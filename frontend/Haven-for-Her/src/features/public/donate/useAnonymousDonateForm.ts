import { useState, type FormEvent } from "react"

import { ApiError, api } from "@/api/client"

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
      await api.post("/api/donations/anonymous", {
        amount: parseFloat(amount),
        currencyCode,
        campaignName: campaign || null,
        donorName: donorName || null,
        donorEmail: donorEmail || null,
        notes: notes || null,
      })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred.")
      }
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
