'use client'

import { EXPERIENCE_LEVELS, type ExperienceLevel } from '@/lib/types'
import { useTranslation } from '@/lib/i18n/context'

export interface PlayerFieldsValues {
  firstName: string
  lastName: string
  age: string
  experience: ExperienceLevel
}

export const emptyPlayerFields: PlayerFieldsValues = {
  firstName: '',
  lastName: '',
  age: '',
  experience: 'new',
}

/** First/last name + age + experience — shared by signup and "+ Add player". */
export function PlayerFieldsForm({
  values,
  onChange,
}: {
  values: PlayerFieldsValues
  onChange: (values: PlayerFieldsValues) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex gap-3">
        <input
          required
          type="text"
          placeholder={t.playerFields.firstName}
          value={values.firstName}
          onChange={(e) => onChange({ ...values, firstName: e.target.value })}
          className="w-1/2 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
        />
        <input
          required
          type="text"
          placeholder={t.playerFields.lastName}
          value={values.lastName}
          onChange={(e) => onChange({ ...values, lastName: e.target.value })}
          className="w-1/2 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
        />
      </div>
      <input
        required
        type="number"
        inputMode="numeric"
        min={4}
        max={19}
        placeholder={t.playerFields.age}
        value={values.age}
        onChange={(e) => onChange({ ...values, age: e.target.value })}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
      />
      <select
        required
        value={values.experience}
        onChange={(e) => onChange({ ...values, experience: e.target.value as ExperienceLevel })}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-primary"
      >
        {EXPERIENCE_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {t.experience[level.value]}
          </option>
        ))}
      </select>
    </>
  )
}
