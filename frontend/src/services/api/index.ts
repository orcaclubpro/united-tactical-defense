import formAPIClient from './FormAPIClient';
import calendarAPIClient, { TimeSlot } from './CalendarAPIClient';
import goHighLevelAppointmentClient, { AppointmentResponse } from './GoHighLevelAppointmentClient';

export { formAPIClient, calendarAPIClient, goHighLevelAppointmentClient };
export type { TimeSlot, AppointmentResponse };

// Re-export common methods for backward compatibility
export const submitLessonRequest = formAPIClient.submitLessonRequest.bind(formAPIClient);
export const submitForm = formAPIClient.submitForm.bind(formAPIClient);
export const validateForm = formAPIClient.validateForm.bind(formAPIClient);
export const getAvailableTimeSlots = calendarAPIClient.getAvailableTimeSlots.bind(calendarAPIClient);
export const getAvailableDatesForMonth = calendarAPIClient.getAvailableDatesForMonth.bind(calendarAPIClient);
export const checkTimeSlotAvailability = calendarAPIClient.checkTimeSlotAvailability.bind(calendarAPIClient);
export const bookTimeSlot = calendarAPIClient.bookTimeSlot.bind(calendarAPIClient);
export const bookTacticalDefenseAppointment = calendarAPIClient.bookTacticalDefenseAppointment.bind(calendarAPIClient);

// GoHighLevel appointment client methods
export const submitAppointmentRequest = goHighLevelAppointmentClient.submitAppointmentRequest.bind(goHighLevelAppointmentClient);
export const submitWithOfflineSupport = goHighLevelAppointmentClient.submitWithOfflineSupport.bind(goHighLevelAppointmentClient);
export const processAppointmentQueue = goHighLevelAppointmentClient.processQueue.bind(goHighLevelAppointmentClient);
export const submitHighLevelForm = goHighLevelAppointmentClient.submitForm.bind(goHighLevelAppointmentClient); 