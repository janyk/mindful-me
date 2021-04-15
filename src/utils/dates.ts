// Credit to not sure who, but thank you for the convenience methods, international dateline isn't fun :)
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { addDays, isSameDay, startOfDay, format as dateFormat } from 'date-fns'

export const clock = {
  get now(): Date {
    return new Date()
  },

  nextMidnight(timezone: string, time?: Date): Date {
    time = time ?? clock.now
    const midnight = this.mostRecentMidnight(timezone, time)

    const daysToAdd = isSameDay(time, midnight) ? 1 : 2
    return addDays(midnight, daysToAdd)
  },

  mostRecentMidnight(timezone: string, time?: Date): Date {
    time = time ?? clock.now
    const midnight = zonedTimeToUtc(startOfDay(time), timezone)

    const daysToAdd = isSameDay(time, midnight) ? 0 : 1
    return addDays(midnight, daysToAdd)
  },

  format(time: Date | number, format: string, timezone: string): string {
    const adjusted = utcToZonedTime(time, timezone)
    return dateFormat(adjusted, format)
  },
}

export const sortByDateAttr = <T>(values: T[], key: keyof T): T[] => {
  if (typeof key !== 'string') return values
  // slice returns a copy of the array, prevents sort from mutating our array in place
  // not really enthused by casting key sas string, but the negation above didn't seem to inform typescript that key is a string
  return values.slice().sort((a, b) => new Date(a[key as string]).getTime() - new Date(b[key as string]).getTime())
}
