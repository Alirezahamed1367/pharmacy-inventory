import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import { classifyExpiry, diffDays } from '../utils/expiryUtils'

export const ExpiryChip = ({ date }) => {
  if (!date) return <Chip size="small" label="نامشخص" variant="outlined" />
  const cls = classifyExpiry(date)
  const d = diffDays(date)
  return (
    <Tooltip title={`روز باقی‌مانده: ${d}`}> 
      <Chip size="small" color={cls.color} label={cls.label} variant={cls.band==='safe' ? 'outlined':'filled'} />
    </Tooltip>
  )
}

export default ExpiryChip