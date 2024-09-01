const Alexa = require('ask-sdk');
const { LocalizationInterceptor } = require('./util.js');
const { getThisWeek } = require('./choreWarsClient.js');
const {
  PersistanceAdapter,
  getParty,
  setParty,
} = require('./persistenceHelper.js');

const GetThisWeek = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetThisWeek'
    );
  },
  async handle(handlerInput) {
    const requestAttributes =
      handlerInput.attributesManager.getRequestAttributes();

    const party = await getParty(handlerInput);

    if (!party) {
      return handlerInput.responseBuilder
        .speak(requestAttributes.t('SETUP_MESSAGE'))
        .getResponse();
    }

    let output;
    try {
      output = await getThisWeek(party);
    } catch (e) {
      console.error(e);
      return handlerInput.responseBuilder
            .speak(
        `${requestAttributes.t('ERROR_MESSAGE')} ${requestAttributes.t('THIS_WEEK_ERROR_MESSAGE')} ${requestAttributes.t('SETUP_ERROR_MESSAGE')}`
      )
        
        .getResponse();
    }

    return handlerInput.responseBuilder
.speak(requestAttributes.t('THIS_WEEK_MESSAGE', party, output))
      .getResponse();
  },
};

const SetUp = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetUp'
    );
  },
  async handle(handlerInput) {
    const requestAttributes =
      handlerInput.attributesManager.getRequestAttributes();

    const party = Alexa.getSlotValue(handlerInput.requestEnvelope, 'party');
    try {
      await setParty(handlerInput, party);
    } catch (e) {
      console.error(e);

      return handlerInput.responseBuilder
        .speak(
          `${requestAttributes.t('ERROR_MESSAGE')} ${requestAttributes.t('SETUP_ERROR_MESSAGE')}`
        )
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('SETUP_SUCCESS', party))
      .getResponse();
  },
};

const LaunchRequest = {
  canHandle(handlerInput) {
    return (
      Alexa.isNewSession(handlerInput.requestEnvelope) ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
    );
  },
  async handle(handlerInput) {
    const requestAttributes =
      handlerInput.attributesManager.getRequestAttributes();

    const party = await getParty(handlerInput);
    if (!party) {
      return handlerInput.responseBuilder
        .speak(requestAttributes.t('WELCOME_MESSAGE'))
        .speak(requestAttributes.t('SETUP_MESSAGE'))
        .getResponse();
    }
    return GetThisWeek.handle(handlerInput);
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const requestAttributes =
      handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t('EXIT_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const requestAttributes =
      handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes =
      handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    SetUp,
    GetThisWeek
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(PersistanceAdapter)
  .lambda();
