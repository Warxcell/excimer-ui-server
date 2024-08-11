import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Render,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Profile } from './Entity/profile';
import { EntityManager } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { UrlGeneratorService } from 'nestjs-url-generator';

class CreateProfile {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  data: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {
  }

  @Get('healthcheck')
  healthcheck() {
    return 'OK';
  }

  @Get()
  @Render('profiles.twig')
  async showProfiles() {
    const profiles = await this.entityManager.find(Profile);

    const getUrl = (id: string) => {
      return this.urlGeneratorService.generateUrlFromController({
        controller: AppController,
        controllerMethod: AppController.prototype.getProfile,
        params: {
          id,
        },
      });
    };

    return { profiles, getUrl };
  }

  @Get('profile/:id')
  @Render('profile.twig')
  async getProfile(@Param('id') id: string) {
    const profile = await this.entityManager.findOneBy(Profile, { id });
    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found`);
    }

    const getUrl = (id: string) => {
      return this.urlGeneratorService.generateUrlFromController({
        controller: AppController,
        controllerMethod: AppController.prototype.getProfileData,
        params: {
          id,
        },
      });
    };

    return { profile, getUrl };
  }

  @Get('profile-data/:id')
  async getProfileData(@Param('id') id: string) {
    const profile = await this.entityManager.findOneBy(Profile, { id });
    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found`);
    }

    return profile.data;
  }

  @Post('profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async ingestProfile(@Body() data: CreateProfile) {
    const profile = new Profile();
    profile.name = data.name;
    profile.data = data.data;

    const dataParsed = JSON.parse(data.data);
    if (dataParsed.profiles[0].unit === 'nanoseconds') {
      profile.duration = dataParsed.profiles[0].endValue;
    } else {
      profile.duration = 0;
    }

    await this.entityManager.save(profile);

    return {
      data: {
        id: profile.id,
      },
    };
  }
}
