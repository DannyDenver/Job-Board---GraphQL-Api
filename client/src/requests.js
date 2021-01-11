import { isLoggedIn, getAccessToken } from './auth';
import gql from 'graphql-tag'
import { ApolloClient, HttpLink, ApolloLink, InMemoryCache } from 'apollo-boost';
const endpointURL = 'http://localhost:9000/graphql';

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        'authorization': 'Bearer ' + getAccessToken()
      }
    })
  }

  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({ uri: endpointURL })
  ]),
  cache: new InMemoryCache()
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    company{
      id
      name
    }
    description
  }
`;

const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}`
  ;

  const companyQuery = gql`query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      title
      company{
        id
        name
      }
      description
      }
  }`;

const jobQuery = gql`
  query JobQuery($id:ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
${jobDetailFragment}
`;

const loadJobQuery = gql`
  query JobsQuery{
    jobs {
      id
      title
      company{
        id 
        name
      }
    }
}`;

export async function createJob(input) {
  const { data: { job } } = await client.mutate({
    createJobMutation,
    variables: { input },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobQuery,
        variables: { id: data.job.id },
        data
      })
    }
  });

  return job;
}

export async function loadCompany(id) {
  const { data: { company } } = await client.query({ query: companyQuery, variables: { id } });
  return company;
}

export async function loadJob(id) {
  const { data: { job } } = await client.query({ query: jobQuery, variables: { id } });
  return job;
}

export async function loadJobs() {
  const { data: { jobs } } = await client.query({ query: loadJobQuery, fetchPolicy: "no-cache" });
  return jobs;
}
