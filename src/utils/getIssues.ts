import axios from 'axios';

export function getProjectIssues() {
  let open_issue_count = 0;
  const repo = 'rc-coffee-chats';
  const owner = 'thechutrain';
  const github_url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  return axios
    .get(github_url, {
      headers: {
        accept: 'application/vnd.github.machine-man-preview'
      }
    })
    .then(result => {
      const issues = result.data;
      issues.forEach(issue => {
        if (issue.state === 'open') {
          open_issue_count += 1;
        }
      });

      return open_issue_count;
    });
}
