const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "nickname commands",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "define o apelido do membro mencionado",
      },
      {
        trigger: "reset <@member>",
        description: "redefinir o apelido do membro",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "mudar o apelido de um membro",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "membro cujo nick você deseja definir",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "apelido para definir",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "redefinir o apelido do membro",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "membros cujo os nick você deseja redefinir",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Could not find matching member");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Please specify a nickname");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Could not find matching member");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `Oops! You cannot manage nickname of ${target.user.tag}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `Oops! I cannot manage nickname of ${target.user.tag}`;
  }

  try {
    await target.setNickname(name);
    return `Successfully ${name ? "changed" : "reset"} nickname of ${target.user.tag}`;
  } catch (ex) {
    return `Failed to ${name ? "change" : "reset"} nickname for ${target.displayName}. Did you provide a valid name?`;
  }
}
