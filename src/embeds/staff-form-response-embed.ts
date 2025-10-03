import { EmbedBuilder, User, Guild } from 'discord.js';

interface StaffFormData {
  id: string;
  nickname: string;
  name: string;
  age: string;
  hour: string;
  about: string;
}

export const staffFormResponseEmbed = (
  user: User,
  guild: Guild,
  formData: StaffFormData,
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor('#2f3136')
    .setAuthor({
      name: guild.name,
      ...(guild.iconURL() ? { iconURL: guild.iconURL()! } : {}),
    })
    .setThumbnail(user.displayAvatarURL())
    .setDescription(
      `**Usuário:** ${user}\n**ID:** \`${user.id}\`\n**Formulário ID:** \`${formData.id}\``,
    )
    .addFields(
      {
        name: 'Nickname',
        value: `\`\`\`${formData.nickname}\`\`\``,
        inline: true,
      },
      {
        name: 'Nome',
        value: `\`\`\`${formData.name}\`\`\``,
        inline: true,
      },
      {
        name: 'Idade',
        value: `\`\`\`${formData.age}\`\`\``,
        inline: true,
      },
      {
        name: 'Horários',
        value: `\`\`\`${formData.hour}\`\`\``,
        inline: true,
      },
      {
        name: 'Motivo',
        value: `\`\`\`${formData.about}\`\`\``,
        inline: false,
      },
    )
    .setFooter({ text: 'Formulário de Staff' })
    .setTimestamp();
};
