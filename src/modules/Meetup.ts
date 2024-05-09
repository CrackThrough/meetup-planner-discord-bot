import { db } from '../db'
import {
  Extension,
  applicationCommand,
  listener,
  option,
} from '@pikokr/command.ts'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  ChatInputCommandInteraction,
  Guild,
  TextChannel,
  roleMention,
} from 'discord.js'

class MeetupExtension extends Extension {
  @listener({ event: 'ready' })
  async ready() {
    this.logger.info(`Logged in as ${this.client.user?.tag}`)
    await this.commandClient.fetchOwners()
  }

  @listener({ event: 'applicationCommandInvokeError', emitter: 'cts' })
  async errorHandler(err: Error) {
    this.logger.error(err)
  }

  isValidDate(date: Date) {
    return date.getTime() === date.getTime()
  }

  async getChannels(
    guild: Guild
  ): Promise<[TextChannel, TextChannel, TextChannel]> {
    const dbResult = await db.guild.findUnique({ where: { id: guild.id } })

    if (!dbResult) {
      throw new Error('This guild is not configured')
    }

    const { announcementChannelId, paymentChannelId, discussionChannelId } =
      dbResult

    await guild.channels.fetch()

    const announcementChannel = guild.channels.cache.get(
      announcementChannelId
    ) as TextChannel

    const paymentChannel = guild.channels.cache.get(
      paymentChannelId
    ) as TextChannel

    const discussionChannel = guild.channels.cache.get(
      discussionChannelId
    ) as TextChannel

    return [announcementChannel, paymentChannel, discussionChannel]
  }

  @applicationCommand({
    name: 'meetup',
    type: ApplicationCommandType.ChatInput,
    description: 'Create a new Meetup Plan',
  })
  async createMeetup(
    i: ChatInputCommandInteraction,
    @option({
      name: 'name',
      description: 'Meetup name',
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    name: string,
    @option({
      name: 'date',
      description: 'Meetup date',
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    date: string
  ) {
    if (!i.guild) {
      return i.reply('This command is only available in guilds')
    }

    const meetupDate = new Date(date)

    if (!this.isValidDate(meetupDate)) {
      return i.reply('Invalid Date')
    }

    const meetupDisplayName = `${meetupDate
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '/')} - ${name}`

    const channelsToCreateThread = await this.getChannels(i.guild)

    const meetupRole = await i.guild.roles.create({
      name: meetupDisplayName,
      mentionable: true,
    })

    await Promise.all(
      channelsToCreateThread.map(async (channel) => {
        const thread = await channel.threads.create({
          name: meetupDisplayName,
          autoArchiveDuration: 1440,
        })

        await thread.send(
          `# ${meetupDisplayName}\n${roleMention(meetupRole.id)}`
        )
      })
    )
  }

  @applicationCommand({
    name: 'settings',
    type: ApplicationCommandType.ChatInput,
    description: 'Change guild settings',
    defaultMemberPermissions: '0',
  })
  async settings(
    i: ChatInputCommandInteraction,
    @option({
      name: 'meetup_announcement',
      description: 'Meetup Announcements Text Channel',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: true,
    })
    announcementChannel: string,
    @option({
      name: 'meetup_payment',
      description: 'Meetup Payment Text Channel',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: true,
    })
    paymentChannel: string,
    @option({
      name: 'meetup_discussion',
      description: 'Meetup Discussion Text Channel',
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: true,
    })
    discussionChannel: string
  ) {
    if (!i.guild) return i.reply('This command is only available in guilds')

    await db.guild.upsert({
      where: { id: i.guild.id },
      create: {
        id: i.guild.id,
        announcementChannelId: announcementChannel,
        paymentChannelId: paymentChannel,
        discussionChannelId: discussionChannel,
      },
      update: {
        announcementChannelId: announcementChannel,
        paymentChannelId: paymentChannel,
        discussionChannelId: discussionChannel,
      },
    })
    return i.reply('Settings updated')
  }
}

export const setup = async () => {
  return new MeetupExtension()
}
