const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "modlog",
  description: "ativar ou desativar logs de moderação",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "canais para enviar logs de mod",
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply("Incorrect command usage");
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setChannel(interaction.options.getChannel("channel"), data.settings);
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings) {
  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return "Eca! Não consigo enviar logs para esse canal? Eu preciso das permissões `Write Messages` e `Embed Links` nesse canal";
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `Configuração salva! Canal Modlog ${targetChannel ? "atualizado" : "removido"}`;
}
