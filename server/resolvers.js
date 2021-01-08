const db = require('./db');

const Query = {
    job: (root, {id}) => db.jobs.get(id),
    jobs: () => db.jobs.list(),
    company: (root, {id}) => db.companies.get(id)
};

// when graphql encounters a job
const Job = {
    company: (job) => db.companies.get(job.companyId)
}

module.exports = { Query, Job };
