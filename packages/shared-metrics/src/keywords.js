/*
 * (c) Copyright IBM Corp. 2021
 * (c) Copyright Instana Inc. and contributors 2020
 */

'use strict';

const { applicationUnderMonitoring } = require('@instana/core').util;

/** @type {import('@instana/core/src/core').GenericLogger} */
let logger;

/**
 * @param {import('@instana/core/src/util/normalizeConfig').InstanaConfig} config
 */
exports.init = function init(config) {
  logger = config.logger;
};

exports.payloadPrefix = 'keywords';
/** @type {Array.<string>} */
// @ts-ignore
exports.currentPayload = [];

const MAX_ATTEMPTS = 20;
const DELAY = 1000;
let attempts = 0;

exports.activate = function activate() {
  attempts++;

  applicationUnderMonitoring.getMainPackageJsonStartingAtMainModule((err, packageJson) => {
    if (err) {
      return logger.warn(`Failed to determine main package json. Reason: ${err?.message} ${err?.stack}`);
    } else if (!packageJson && attempts < MAX_ATTEMPTS) {
      setTimeout(exports.activate, DELAY).unref();

      return;
    } else if (!packageJson) {
      // final attempt failed, ignore silently
      return;
    }

    if (packageJson.keywords) {
      // @ts-ignore
      exports.currentPayload = packageJson.keywords;
    }
  });
};
