import { DateTime } from "Luxon"

export const dateIsWithinHour = (dateCheck: DateTime<true>): boolean => {
    let currentDateTime = DateTime.now()
    let lastHour = currentDateTime.minus({ minutes: 1})

    if (dateCheck >= lastHour && dateCheck <= currentDateTime) {
        return true
    } else {
        return false
    }

}