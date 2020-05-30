var express = require('express');
var router = express.Router();
var _ = require('lodash');

const Teamwork = require('teamwork-api')(process.env.TW_API_KEY, process.env.TW_SUB_DOMAIN);

const companiesMetaData = [
  {
    key: 'id',
    type: 'singleLineText',
    fieldName: 'id',
    apiMap: 'id',
    hideInPreviewTable: true
  },
  {
    key: 'name',
    type: 'singleLineText',
    fieldName: 'Company Name',
    apiMap: 'name',
  },
];

const projectMetaData = [
  {
    key: 'id',
    type: 'singleLineText',
    fieldName: 'id',
    apiMap: 'id',
    hideInPreviewTable: true
  },
  {
    key: 'companyId',
    type: 'singleLineText',
    fieldName: 'company id',
    apiMap: 'company.id',
    hideInPreviewTable: true
  },
  {
    key: 'name',
    type: 'singleLineText',
    fieldName: 'Name',
    apiMap: 'name',
  },
  {
    key: 'archived',
    type: 'checkbox',
    fieldName: 'Archived',
    apiMap: 'status',
    transformValue: (value) => {
      return (value == 'archived') ? true : false
    },
  },
  {
    key: 'companyLink',
    type: 'multipleRecordLinks',
    fieldName: 'Company',
    query: {
      table: 'Companies',
      field: 'id',
      match: 'company id'
    }
  }
];

const prepare = (results, metaData) => {
  return {
    metaData: metaData,
    fields: results.map((result) => {
      let preparedResult = {};
      metaData.map((field) => {
        if (!field.apiMap) { return }
        preparedResult[field.key] = (field.transformValue)
          ? field.transformValue(_.get(result, field.apiMap))
          : _.get(result, field.apiMap);
      });
      return preparedResult;
    })
  };
}

router.get('/', async (req, res, next) => {
  companies = await Teamwork.companies.get().then(results => (results.companies));

  res.send(prepare(companies, companiesMetaData));
});

router.get('/projects', async (req, res, next) => {
  projects = await Teamwork.projects.get({status: 'ALL', catId: 29021}).then(results => (results.projects));
  
  res.send(projects); //prepare(projects, projectMetaData)
});

router.get('/time', async (req, res, next) => {
  time = await Teamwork.time.get({projectId: '346195'});
  
  res.send(time);
});

module.exports = router;