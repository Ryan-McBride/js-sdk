'use strict';

var moment = require('moment');
var timekit = require('../src/timekit.js');
var utils = require('./helpers/utils');

var fixtures = {
  app:            'demo',
  apiBaseUrl:     'http://api-localhost.timekit.io/',
  calendarToken:  '1e396a70-1919-11e5-a165-080027c7e7dd',
  userEmail:      'timebirdcph@gmail.com',
  userInvalidEmail: 'invaliduser@gmail.com',
  userPassword:   'password',
  userApiToken:   'password',
  findTime: {
    emails: ['timebirdcph@gmail.com', 'timebirdnyc@gmail.com'],
    filters: {
      'or': [
        { 'specific_day': {'day': 'Monday'} },
        { 'specific_day_and_time': {'day': 'Wednesday', 'start': 10, 'end': 12, 'timezone': 'Europe/Copenhagen'} }
      ],
      'and': [
        { 'business_hours': {'timezone': 'America/Los_angeles'} }
      ]
    },
    future: '3 days',
    lengthVar: '30 minutes',
    sort: 'asc'
  },
  eventsStart:    moment().format(),
  eventsEnd:      moment().add(3,'weeks').format(),
  availabilityEmail: 'timebirdnyc@gmail.com',
  meetingToken:   '7zdMNR48cJTjIRhz',
  newMeeting: {
    what:         'test title',
    where:        'test location',
    suggestions: [
      {
        start:    '2015-09-22T14:30:00.000Z',
        end:      '2015-09-22T16:00:00.000Z'
      },
      {
        start:    '2015-09-23T09:15:00.000Z',
        end:      '2015-09-23T09:45:00.000Z'
      }
    ]
  },
  updateMeetingData: {
    what:         'new test title',
    where:        'new test location'
  },
  meetingAvailability: {
    suggestionId: '1',
    available:    true
  },
  inviteToMeetingEmails: [
    'some_test_user@timekit.io',
    'some_other_test_user@timekit.io'
  ],
  newUser: {
    firstName:    'John',
    lastName:     'Doe',
    email:        utils.emailGenerator(),
    password:     'password',
    timezone:     'Europe/Copenhagen'
  },
  updateUser: {
    first_name:   'Jane',
    timezone:     'Europe/Berlin'
  },
  getUserPropertyKey: 'timebirdcphgmailcom-google-next-sync-token',
  setUserProperties: {
    testKey1:      'testValue1',
    testKey2:      'testValue2'
  }
}

/**
 * Call API endpoints that doesnt require auth headers
 */
describe('API endpoints without auth', function() {

  beforeEach(function() {

    timekit.configure({
      app: fixtures.app,
      apiBaseUrl: fixtures.apiBaseUrl
    });

  });

  it('should be able to authenticate by calling [GET] /auth', function(done) {

    timekit.auth(fixtures.userEmail, fixtures.userPassword)
    .then(function(response) {
      expect(response.data.data.email).toBeDefined();
      expect(typeof response.data.data.email).toBe('string');
      expect(response.data.data.api_token).toBeDefined();
      expect(typeof response.data.data.api_token).toBe('string');
      done();
    });

  });

  it('should be able to fail authentication with wrong credentials by calling [GET] /auth', function(done) {

    timekit.auth(fixtures.userInvalidEmail, fixtures.userPassword)
    .catch(function(response) {
      expect(typeof response.data.error.message).toBe('string');
      expect(response.data.error.status_code).toBe(401);
      done();
    });

  });

  it('should be able to call [GET] /accounts/google/signup endpoint', function() {

    var result = timekit.accountGoogleSignup();

    // should match a valid HTTP(S) url
    expect(result).toMatch(/^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?([\/\\\w\.()-]*)?(?:([?][^#]*)?(#.*)?)*/gmi);

  });

});

/**
 * Call API endpoints that requires auth headers
 */
describe('API endpoints with auth', function() {

  beforeEach(function() {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

    timekit.configure({
      app: fixtures.app,
      apiBaseUrl: fixtures.apiBaseUrl
    });

    timekit.setUser(fixtures.userEmail, fixtures.userApiToken);

  });

  it('should be able to call [POST] /findtime endpoint', function(done) {

    timekit.findTime(
      fixtures.findTime.emails,
      fixtures.findTime.filters,
      fixtures.findTime.future,
      fixtures.findTime.lengthVar,
      fixtures.findTime.sort
    ).then(function(response) {
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /accounts endpoint', function(done) {

    timekit.getAccounts().then(function(response) {
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  // it('should be able to call [GET] /accounts/google/calendars endpoint', function(done) {

  //   timekit.getAccountGoogleCalendars().then(function(response) {
  //     expect(response.data).toBeDefined();
  //     expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
  //     done();
  //   });

  // });

  // it('should be able to call [GET] /accounts/sync endpoint', function(done) {

  //   timekit.accountSync().then(function(response) {
  //     expect(response.data).toBeDefined();
  //     expect(typeof response.data.count).toBe('number');
  //     done();
  //   });

  // });

  it('should be able to call [GET] /calendars', function(done) {

    timekit.getCalendars().then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /calendar/:token', function(done) {

    timekit.getCalendar(fixtures.calendarToken).then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(typeof response.data.data.name).toBe('string');
      done();
    });

  });

  it('should be able to call [GET] /contacts', function(done) {

    timekit.getContacts().then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /events', function(done) {

    timekit.getEvents(
      fixtures.eventsStart,
      fixtures.eventsEnd
    ).then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /events/availability', function(done) {

    timekit.getAvailability(
      fixtures.eventsStart,
      fixtures.eventsEnd,
      fixtures.availabilityEmail
    ).then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /meetings', function(done) {

    timekit.getMeetings().then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /meetings/:token', function(done) {

    timekit.getMeeting(fixtures.meetingToken).then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(typeof response.data.data.what).toBe('string');
      done();
    });

  });

  it('should be able to call [POST] /meetings', function(done) {

    timekit.createMeeting(
      fixtures.newMeeting.what,
      fixtures.newMeeting.where,
      fixtures.newMeeting.suggestions
    ).then(function(response) {
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(typeof response.data.data.what).toBe('string');
      done();
    });

  });

  it('should be able to call [PUT] /meetings/:token', function(done) {

    timekit.updateMeeting(
      fixtures.meetingToken,
      fixtures.updateMeetingData
    ).then(function(response) {
      expect(response.status).toBe(204);
      done();
    });

  });

  it('should be able to call [POST] /meetings/availability', function(done) {

    timekit.setMeetingAvailability(
      fixtures.meetingAvailability.suggestionId,
      fixtures.meetingAvailability.available
    ).then(function(response) {
      expect(response.status).toBe(204);
      done();
    });

  });

  // it('should be able to call [POST] /meetings/book', function(done) {

  //   timekit.createMeeting(
  //     fixtures.newMeeting.what,
  //     fixtures.newMeeting.where,
  //     fixtures.newMeeting.suggestions
  //   ).then(function(response) {
  //     var suggestionId = response.data.data.suggestions[0].id;
  //     return timekit.bookMeeting(
  //       suggestionId
  //     )
  //   }).then(function(response) {
  //     expect(response.status).toBe(204);
  //     done();
  //   });;

  // });

  // it('should be able to call [POST] /meetings/:token/invite', function(done) {

  //   timekit.inviteToMeeting(
  //     fixtures.meetingToken,
  //     fixtures.inviteToMeetingEmails
  //   ).then(function(response) {
  //     expect(response.status).toBe(204);
  //     done();
  //   });

  // });

  it('should be able to call [POST] /users', function(done) {

    timekit.createUser(
      fixtures.newUser.firstName,
      fixtures.newUser.lastName,
      fixtures.newUser.email,
      fixtures.newUser.password,
      fixtures.newUser.timezone
    ).then(function(response) {
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(typeof response.data.data.email).toBe('string');
      done();
    });

  });

  it('should be able to call [GET] /users/me', function(done) {

    timekit.getUserInfo().then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(typeof response.data.data.email).toBe('string');
      done();
    });

  });

  it('should be able to call [PUT] /users/me', function(done) {

    timekit.updateUser({
      first_name: fixtures.updateUser.firstName,
      timezone: fixtures.updateUser.timezone,
    }).then(function(response) {
      expect(response.status).toBe(204);
      done();
    });

  });

  it('should be able to call [GET] /properties', function(done) {

    timekit.getUserProperties().then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Object.prototype.toString.call(response.data.data)).toBe('[object Array]');
      done();
    });

  });

  it('should be able to call [GET] /properties/:key', function(done) {

    timekit.getUserProperty(fixtures.getUserPropertyKey).then(function(response) {
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(typeof response.data.data.value).toBe('string');
      done();
    });

  });

  it('should be able to call [PUT] /properties', function(done) {

    timekit.setUserProperties(fixtures.setUserProperties).then(function(response) {
      expect(response.status).toBe(204);
      done();
    });

  });

});