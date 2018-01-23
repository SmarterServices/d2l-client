'use strict';

const Client = require('./../../index');
const mockData = require('./../data/mock.json');
const expect = require('chai').expect;
const {mockD2LEndpoints} = require('./mock');

describe('Client', function testClient() {
  const d2lConfig = {
    host: 'https://devcop.brightspace.com',
    port: 443,
    appId: 'test',
    appKey: 'test'
  };
  let client;

  before('Mock endpoints', function mockEndpoints() {
    mockD2LEndpoints(d2lConfig.host);
  });

  it('Should create new client', function testCreateNewClient() {
    client = new Client(d2lConfig);
    expect(client).instanceof(Client);
  });

  describe('List enrollments', function testListEnrollments() {
    it('Should list enrollments for valid arguments', () => {
      const {version, orgUnitId} = mockData.listClass.requests.valid.params;

      return client
        .listEnrollments(version, orgUnitId, 'test', 'test')
        .then(enrollments => {
          enrollments.forEach(enrollment => {
            expect(enrollment.courseId).to.equal(orgUnitId.toString());

            const expectedKeys = [
              'courseId',
              'userId',
              'firstName',
              'lastName',
              'emailAddress',
              'enrollmentState',
              'rootAccountId',
              'role'
            ];
            expect(enrollment).to.have.all.keys(expectedKeys);
          });
        });
    });

    it('Should reject with error for invalid version', () => {
      const {version, orgUnitId} = mockData.listClass.requests.invalidVersion.params;

      return client
        .listEnrollments(version, orgUnitId, 'test', 'test')
        .catch(error => {
          expect(error.statusCode).to.equal(400);
        });
    });
  });

  describe('List quizzes', function testListQuizzes() {
    it('Should list quizzes for valid arguments', () => {
      const {version, orgUnitId} = mockData.listQuizzes.requests.valid.params;

      return client
        .listQuizzes(version, orgUnitId, 'test', 'test')
        .then(quizzes => {
          expect(quizzes).to.eql(mockData.listQuizzes.requests.valid.response);
        });
    });

    it('Should reject with error for invalid version', () => {
      const {version, orgUnitId} = mockData.listQuizzes.requests.invalidVersion.params;

      return client
        .listQuizzes(version, orgUnitId, 'test', 'test')
        .catch(error => {
          expect(error.statusCode).to.equal(400);
        });
    });
  });
});
