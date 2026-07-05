const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { resolveTarget } = require('../utils/roblox');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banasync')
    .setDescription('Ban a player across all servers')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('User ID or username')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false)),
  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getString('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const resolved = await resolveTarget(target);

      const response = await axios.post(`${process.env.API_URL}/banasync`, {
        target: resolved.userId,
        reason,
        executor: interaction.user.username,
        username: resolved.username,
        displayName: resolved.displayName,
      });

      const embed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('Async Ban')
        .setDescription(
          `●  Username: ${resolved.username}\n` +
          `   ├─ UserId: ${resolved.userId}\n` +
          `   ├─ Action: Async ban\n` +
          `   ├─ Reason: ${reason}\n` +
          `   └─ Status: Banned`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error')
        .setDescription(`\`\`\`${error.response?.data?.error || error.message}\`\`\``)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};