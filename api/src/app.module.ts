import { Module } from '@nestjs/common';
import { TeamsModule } from './teams/teams.module.js';
import { CharactersModule } from './characters/characters.module.js';

@Module({
  imports: [TeamsModule, CharactersModule],
})
export class AppModule {}
