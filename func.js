const fs = ("fs")
const {
  REST,
  Routes,
  Collection,
  Client,
  GatewayIntentBits,
} = require("discord.js");

const client = new Client({
intents: [
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.Guilds,
]
});
const {clientId} = require('./config.json')

function register() {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, 'commands')
    const commands = [];
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('js'));
  
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      commands.push(command.data.toJSON());
    }
    const rest = new REST({ version: '10' }).setToken(process.env['DISCORD_BOT_TOKEN']);
    (async () => {
      try {
        console.log(`${commandFiles}`);
        console.log(`${commands.length}個のアプリケーションコマンドを登録します`);
  
        const data = await rest.put(
          Routes.applicationCommands(clientId),
          { body: commands },
        );
  
        console.log(`${data.length}個のアプリケーションコマンドを登録しました。`);
      } catch (error) {
        console.error(error);
      }
    })();
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`${filePath}に必要な"data"か"execute"がありません`)
      }
  
    }
  }

  function loadButtonData() {
    const data = fs.readFileSync('./data/buttonData.json', 'utf8');
    return JSON.parse(data);
  }
  
  module.exports = {
    register,
    loadButtonData,
  }