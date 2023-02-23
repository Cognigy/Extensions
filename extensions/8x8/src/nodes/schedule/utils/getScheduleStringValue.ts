import { ScheduleName, ScheduleOption } from '../constants/ScheduleValuesConstants';

export function getScheduleStringValue(scheduleValue: string | number): string {
  if (scheduleValue === ScheduleOption.Open) {
    return ScheduleName.Open;
  }
  if (scheduleValue === ScheduleOption.Closed) {
    return ScheduleName.Closed;
  }
  return scheduleValue.toString();
}
