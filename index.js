const fs = require('fs');
const path = require('path');
const server = require('./server.js'); 
const buttonkit = require('./button.js')
const func = require('./func.js')
require('dotenv').config();
server.Server();


const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
  ]
});//intents設定

if (process.env['DISCORD_BOT_TOKEN'] == undefined) {
  console.error("TOKENが設定されていません。");
  process.exit(0);
}//不正なtoken検知

console.log("起動準備中...")

client.on("ready", () => {

  func.register()
  
  setTimeout(()=>{
     console.log("―――起動完了―――")
    }, 2500)

});//readyevent

client.login(process.env['DISCORD_BOT_TOKEN']);//ログイン

client.on('interactionCreate', async interaction => {
  try{
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`${interaction.commandName} が見つかりません。`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
  }catch(e){interaction.channel.send("Interationでエラーが発生しました。\n少し時間を開けて再度実行してください。")}
});//スラッシュコマンド設定

let bmessage;
let brole;
let bcid;
let bephe;

client.on('interactionCreate', async interaction => {
if(interaction.commandName === "button"){
  const subcommand = interaction.options.getSubcommand();
  const bid = Math.floor(1000 + Math.random() * 9000);
  if (subcommand === 'normal設置') {
    const bname = interaction.options.getString('name');
    const btype = interaction.options.getString('type');
    bmessage = interaction.options.getString('sendmessage');
    brole = interaction.options.getRole('role');
    let bepheA = interaction.options.getBoolean('ephemeral');
    bephe = `${bepheA}`
    
    console.log(bephe)
    bcid = `${bname}:${bid}` 
   const button = new ButtonBuilder()
      .setCustomId(`${bcid}`)
      .setLabel(`${bname}`)
      .setStyle(`${btype}`)
      
      
  const row = new ActionRowBuilder().setComponents(button)
    interaction.reply({components: [row]})
    if(brole){
    brole = `${brole.name}`
    }else{brole = ""}
    buttonkit.saveDataToBcid(bcid, bmessage, brole ,bephe)

  }
}
if(interaction.commandName === "button"){
  const subcommand = interaction.options.getSubcommand();
  const bid = Math.floor(1000 + Math.random() * 9000);
  if (subcommand === 'ntsr表記') {
    let b1, b2, b3, b4, b5;
    let buttons = [];
    
    try {
        b1 = interaction.options.getString('text1');
        b2 = interaction.options.getString('text2');
        b3 = interaction.options.getString('text3');
        b4 = interaction.options.getString('text4');
        b5 = interaction.options.getString('text5');
    } catch (e) {
        console.log("Error: ", e.message);
    }

    const processButton = (inputString, bid) => {
        const parts = inputString.split(/!(?![^{]*})/);
        const [name, type, message, role] = parts.map(part => part.replace('{', '').replace('}', ''));

        const bcid = `${name}:${bid}`;
        const bmessage = message;
        let brole = role;

        const button = new ButtonBuilder()
            .setCustomId(bcid)
            .setLabel(name)
            .setStyle(type);

        buttons.push(button);

        if (brole) {
            brole = `${brole.name}`;
        } else {
            brole = "";
        }

        buttonkit.saveDataToBcid(bcid, bmessage, brole);
    };

    processButton(b1, bid);

    [b2, b3, b4, b5].forEach((buttonText, index) => {
        if (buttonText) {
            processButton(buttonText, bid);
        }
    });

    const row = new ActionRowBuilder().setComponents(buttons);
    interaction.reply({ components: [row] });
}

}
});//スラッシュコマンド設定


client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;
  console.log(interaction.customId)
  
  try {
    interaction.deferReply();
    // ボタンデータの読み込み
    const buttonData = loadButtonData();
    console.log(buttonData.hasOwnProperty(interaction.customId))

    // interaction.customIdが保存されていたJsonのbcidと一致した場合
    if (buttonData.hasOwnProperty(interaction.customId)) {
      console.log("pong")
      const data = buttonData[interaction.customId];

      // メッセージがある場合はそれを送信
      if (data.message) {
        if(data.ephe === "true"){
          
         
          interaction.editReply({ content: `${data.message}`, ephemeral: true });
          
          
        }
        else{
          console.log(data.message)
          interaction.reply(data.message);
        }
        
      }

      // ロールがある場合はそれを付与
      if (data.role) {
        console.log("pong!!")
        const role = interaction.guild.roles.cache.find(role => role.name === data.role);
        if (role) {
          try{
          const member = interaction.guild.members.cache.get(interaction.user.id);
          member.roles.add(role);
          }catch(e){interaction.reply("ロールの付与に失敗しました。\nロール管理の権限がないか、このBOTのロールより上位のロールまたは無効なロールを付与しようとしています。")}
        }
      }
    }
  } catch (error) {
    console.error('Error handling button interaction:', error);
  }
});

// ボタンデータの読み込み
func.loadButtonData();

