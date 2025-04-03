/**
 * Core Interfaces Index
 * Exports all interface modules
 */

const repositories = require('./repositories');
const services = require('./services');
const { EventEmitterInterface, EventSubscriberInterface } = require('./eventSystem');
const formAdapter = require('./adapters/formAdapter');

module.exports = {
  ...repositories,
  ...services,
  EventEmitterInterface,
  EventSubscriberInterface,
  ...formAdapter
}; 