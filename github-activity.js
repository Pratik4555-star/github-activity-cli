import https from 'https'
import process from 'process'

async function fetchActivity(username) {
    const url = `https://api.github.com/users/${username}/events`;

    const options={
        headers:{
            'User-Agent': 'Node.js CLI'
        }
    };

    https.get(url,options, (res)=> {
        let data = ''

        res.on('data',(chunk)=>{
            data += chunk
        });

        res.on('end',() => {
            if(res.statusCode === 200){
                try {
                    const events = JSON.parse(data);
                    if(events.length === 0){
                        console.log(`No recent activity found for user: ${username}`);
                        return;
                    }

                    console.log(`Recent acitvity of user: ${username}`);
                    events.forEach((event) => {
                        let action = '';
                        switch (event.type){
                            case 'PushEvent':
                                action = `Pushed ${event.payload.commits.length} commit(s) to ${event.repo.name}`;
                                break;
                            case 'IssuesEvent':
                                action = `${event.payload.action} an issue in ${event.repo.name}`;
                                break;
                            case 'WatchEvent':
                                action = `Starred ${event.repo.name}`;
                                break;
                            default:
                                action = `${event.type.replace('Event', '')} in ${event.repo.name}`;
                                break;
                        }
                        console.log(`-${action}`)
                    });
                } catch (error) {
                    console.error('Error parsing response:', err.message);
                }
            }else{
                console.error(`Error: Unable to fetch data (Status Code: ${res.statusCode})`);
            }
        });
    }).on('error',(err)=>{
        console.error('Error: Unable to connect to GitHub API:', err.message);
    });
}

const args = process.argv.slice(2)

if(args.length !== 1) {
    console.error('Usage: node github-activity.js <username>');
    process.exit(1);
}

const username = args[0];
fetchActivity(username);