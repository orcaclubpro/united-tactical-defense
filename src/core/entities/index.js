/**
 * Core Entities
 * Domain models that represent business objects
 */

const Form = require('./form');
const User = require('./user');
const Analytics = require('./analytics');
const FormSubmissionEvent = require('./formSubmissionEvent');

/**
 * Lead Entity
 */
class Lead {
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.source = data.source || '';
    this.status = data.status || 'new';
    this.notes = data.notes || '';
    this.assignedTo = data.assignedTo || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      source: this.source,
      status: this.status,
      notes: this.notes,
      assignedTo: this.assignedTo,
      fullName: this.fullName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Appointment Entity
 */
class Appointment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.leadId = data.leadId || null;
    this.userId = data.userId || null;
    this.date = data.date instanceof Date ? data.date : new Date(data.date || Date.now());
    this.timeSlot = data.timeSlot || '';
    this.duration = data.duration || 60; // minutes
    this.status = data.status || 'scheduled';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      leadId: this.leadId,
      userId: this.userId,
      date: this.date,
      timeSlot: this.timeSlot,
      duration: this.duration,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Form Submission Entity
 */
class FormSubmission {
  constructor(data = {}) {
    this.id = data.id || null;
    this.formType = data.formType || '';
    this.data = data.data || {};
    this.status = data.status || 'new';
    this.leadId = data.leadId || null;
    this.ipAddress = data.ipAddress || '';
    this.userAgent = data.userAgent || '';
    this.createdAt = data.createdAt || new Date();
    this.processedAt = data.processedAt || null;
  }

  toJSON() {
    return {
      id: this.id,
      formType: this.formType,
      data: this.data,
      status: this.status,
      leadId: this.leadId,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt,
      processedAt: this.processedAt
    };
  }
}

/**
 * Analytics Event Entity
 */
class AnalyticsEvent {
  constructor(data = {}) {
    this.id = data.id || null;
    this.eventType = data.eventType || '';
    this.userId = data.userId || null;
    this.sessionId = data.sessionId || '';
    this.data = data.data || {};
    this.ipAddress = data.ipAddress || '';
    this.userAgent = data.userAgent || '';
    this.timestamp = data.timestamp || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      eventType: this.eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      data: this.data,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      timestamp: this.timestamp
    };
  }
}

module.exports = {
  User,
  Lead,
  Appointment,
  FormSubmission,
  AnalyticsEvent,
  Form,
  Analytics,
  FormSubmissionEvent
}; 