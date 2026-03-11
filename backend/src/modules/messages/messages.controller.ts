import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";

@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post("generate")
  generate(
    @Body()
    body: {
      venue: {
        name: string;
        city?: string;
        category?: string;
        instagram?: string;
      };
      djName?: string;
      mixLink?: string;
    },
  ) {
    const message = this.messagesService.generateMessage(
      body.venue,
      body.djName,
      body.mixLink,
    );
    return { message };
  }
}
