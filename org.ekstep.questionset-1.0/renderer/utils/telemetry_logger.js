var TelemetryService = TelemetryService || {};
var QSTelemetryLogger = {
  EVENT_TYPES: {
    TOUCH: 'TOUCH',
    RESPONSE: 'RESPONSE',
    ASSESS: 'ASSESS',
    ASSESSEND: 'ASSESSEND'
  },
  _plugin: {},
  _question: {},
  _assessStart: {},
  _qData: {},
  _qConfig: {}
};
QSTelemetryLogger.setQuestion = function(ques, index) {
  //Set by Question-set while rendering a new question
  this._plugin = EkstepRendererAPI.getPluginObjs(ques.pluginId);
  this._question = ques;
  this._question.index = index;

  var qData = this._question.data.__cdata || this._question.data;
  this._qData = JSON.parse(qData);

  var qConfig = this._question.config.__cdata || this._question.config;
  this._qConfig = JSON.parse(qConfig);
};
QSTelemetryLogger.logInteract = function(data) {
  TelemetryService.interact(data.type, data.id, this.EVENT_TYPES.TOUCH, { stageId: Renderer.theme._currentStage });
};
QSTelemetryLogger.logResponse = function(data) {
  var edata = {
    "target": {
      "id": this._plugin._manifest.id ? this._plugin._manifest.id : "",
      "ver": this._plugin._manifest.ver ? this._plugin._manifest.ver : "1.0",
      "type": this._plugin._manifest.type ? this._plugin._manifest.type : "plugin"
    },
    "type": data.type,
    "res": data.values
  };
  TelemetryService.itemResponse(edata);
};
QSTelemetryLogger.logAssess = function() {
  if (this._qData.questionnaire) {
    for (var quesIdentifier in this._qData.questionnaire.items) {
      if (this._qData.questionnaire.items.hasOwnProperty(quesIdentifier)) {
        this._assessStart = TelemetryService.assess(this._question.id, this._qData.questionnaire.items[quesIdentifier][0].language, this._qData.questionnaire.items[quesIdentifier][0].qlevel, { maxscore: this._qData.questionnaire.items[quesIdentifier][0].max_score }).start();
      }
    }
  } else {
    this._assessStart = TelemetryService.assess(this._question.id, this._qConfig.metadata.medium, this._qConfig.metadata.qlevel, { maxscore: this._qConfig.metadata.max_score }).start();
  }
};
QSTelemetryLogger.logAssessEnd = function(result) {
  var quesTitle, quesDesc, quesScore;
  if (this._qData.questionnaire) {
    for (var quesIdentifier in this._qData.questionnaire.items) {
      if (this._qData.questionnaire.items.hasOwnProperty(quesIdentifier)) {
        quesTitle = this._qData.questionnaire.items[quesIdentifier][0].title;
        quesDesc = this._qData.questionnaire.items[quesIdentifier][0].description;
        quesScore = result.pass != 0 ? this._qData.questionnaire.items[quesIdentifier][0].max_score : 0;
      }
    }
  }
  else{
    quesTitle = this._qConfig.metadata.title;
    quesDesc = this._qConfig.metadata.description ? this._qConfig.metadata.description : '';
    quesScore = parseFloat((result.score).toFixed(2));
  }
  var data = {
    pass: result.eval,
    score: quesScore,
    res: result.values,
    qindex: this._question.index,
    qtitle: quesTitle,
    qdesc: quesDesc,
    mc: [],
    mmc: []
  };
  TelemetryService.assessEnd(this._assessStart, data);
};
QSTelemetryLogger.logEvent = function(type, data) {
  switch (type.toUpperCase()) {
    case this.EVENT_TYPES.TOUCH:
      this.logInteract(data);
      break;
    case this.EVENT_TYPES.ASSESS:
      this.logAssess();
      break;
    case this.EVENT_TYPES.RESPONSE:
      this.logResponse(data);
      break;
    case this.EVENT_TYPES.ASSESSEND:
      this.logAssessEnd(data);
      break;
    case 'DEFAULT':
      return true;
  }
};
//# sourceURL=telemetryLogger.js