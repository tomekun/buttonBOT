const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');  // 追加

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('操作設定など説明を表示させます'),
  execute: async function(interaction) {
    const filePath = path.join(__dirname, '..','textFolder', '/help.txt'); // ファイルパスの指定

    // ファイルを非同期で読み込み
    fs.readFile(filePath, 'utf-8', (err, data)  => {
      if (err) {
        console.error('Error reading file:', err);
        interaction.reply('An error occurred while reading the file.'); // interaction.replyを使用
        return;
      }

      // 読み込んだファイルの内容を表示
      interaction.reply({content:`File Contents:\n\`\`\`\n${data}\n\`\`\``, ephemeral: true });
    });
  }
};


