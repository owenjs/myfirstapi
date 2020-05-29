var express = require('express');
var router = express.Router();

const Teamwork = require('teamwork-api')(process.env.TW_API_KEY, process.env.TW_SUB_DOMAIN);

const prepareProjects = (projects) => {
  return projects.map((project) => {
    return {
      id: project.id,
      companyId: project.company.id,
      name: project.name,
      archived: (project.status == 'archived') ? true : false
    };
  });
};

const prepareCompanies = (companies) => {
  var companiesPrepared = [];
  for (var i = 0; i < companies.length; i++) {
    let company = companies[i];
    companiesPrepared.push({id: company.id, name: company.name});
  }
  return companiesPrepared;
}

router.get('/', async (req, res, next) => {
  results = await Teamwork.companies.get();

  res.send(prepareCompanies(results.companies));
});

router.get('/projects', async (req, res, next) => {
  projects = await Teamwork.projects.get({status: 'ALL', catId: 29021}).then(results => (results.projects));
  
  res.send(prepareProjects(projects));
});

module.exports = router;