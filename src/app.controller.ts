import {
  Body,
  Controller,
  Get,
  HttpRedirectResponse,
  NotFoundException,
  Param,
  Post,
  Query,
  Render,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Profile } from './entity/profile';
import { EntityManager } from 'typeorm';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { Type } from 'class-transformer';

class CreateProfile {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  data: string;
}

class ProfileQuery {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {}

  @Get('healthcheck')
  healthcheck() {
    return 'OK';
  }

  @Get()
  @Render('profiles.twig')
  @UsePipes(new ValidationPipe({ transform: true }))
  async showProfiles(@Query() query: ProfileQuery) {
    const perPage: number = 10;

    const currentPage = query.page || 1;

    const countPromise = this.entityManager.count(Profile);

    const profilesPromise = this.entityManager.find(Profile, {
      order: {
        createdAt: {
          direction: 'DESC',
        },
      },
      skip: perPage * (currentPage - 1),
      take: perPage,
    });

    const getProfileUrl = (id: string) => {
      return this.urlGeneratorService.generateUrlFromController({
        controller: AppController,
        controllerMethod: AppController.prototype.getProfile,
        params: {
          id,
        },
      });
    };
    const getUrl = (page: number) => {
      return this.urlGeneratorService.generateUrlFromController({
        controller: AppController,
        controllerMethod: AppController.prototype.showProfiles,
        query: {
          page: page.toString(),
        },
      });
    };

    const [profiles, count] = await Promise.all([
      profilesPromise,
      countPromise,
    ]);

    const totalPages = Math.ceil(count / perPage);

    if (currentPage > totalPages) {
      return {
        url: getUrl(1),
        statusCode: 302,
      } satisfies HttpRedirectResponse;
    }

    return {
      profiles,
      getUrl,
      getProfileUrl,
      totalPages,
      currentPage: currentPage,
    };
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
