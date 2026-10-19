import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../db.js';
import { CharacterDto, StatusDto } from './character.dto.js';

@Injectable()
export class CharactersService {
  async findAll(status?: string, teamId?: number) {
    const res = await pool.query('SELECT * FROM characters ORDER BY id');
    let lista = res.rows;
    if (status) {
      lista = lista.filter((c) => c.status === status);
    }
    if (teamId) {
      lista = lista.filter((c) => c.team_id === teamId);
    }
    return lista;
  }

  async findOne(id: number) {
    const res = await pool.query('SELECT * FROM characters WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`El personaje con id ${id} no fue encontrado`);
    }
    const character = res.rows[0];
    const team = await pool.query('SELECT * FROM teams WHERE id = $1', [character.team_id]);
    character.team = team.rows[0] || null;
    return character;
  }

  async create(dto: CharacterDto) {
    await this.checkAlias(dto.alias);
    await this.checkTeam(dto.team_id);
    const res = await pool.query(
      'INSERT INTO characters (real_name, alias, main_power, power_level, status, is_villain, team_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        dto.real_name,
        dto.alias,
        dto.main_power,
        dto.power_level,
        dto.status ?? 'ACTIVE',
        dto.is_villain ?? false,
        dto.team_id ?? null,
      ],
    );
    return res.rows[0];
  }

  async update(id: number, dto: CharacterDto) {
    const character = await this.findOne(id);
    await this.checkAlias(dto.alias, id);
    await this.checkTeam(dto.team_id);
    this.checkStatus(character.status, dto.status ?? 'ACTIVE');
    const res = await pool.query(
      'UPDATE characters SET real_name = $1, alias = $2, main_power = $3, power_level = $4, status = $5, is_villain = $6, team_id = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [
        dto.real_name,
        dto.alias,
        dto.main_power,
        dto.power_level,
        dto.status ?? 'ACTIVE',
        dto.is_villain ?? false,
        dto.team_id ?? null,
        id,
      ],
    );
    return res.rows[0];
  }

  async updateStatus(id: number, dto: StatusDto) {
    const character = await this.findOne(id);
    this.checkStatus(character.status, dto.status);
    const res = await pool.query('UPDATE characters SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [
      dto.status,
      id,
    ]);
    return res.rows[0];
  }

  async remove(id: number) {
    await this.findOne(id);
    await pool.query('DELETE FROM characters WHERE id = $1', [id]);
  }

  async checkAlias(alias: string, id = 0) {
    const res = await pool.query('SELECT id FROM characters WHERE alias = $1 AND id <> $2', [alias, id]);
    if (res.rows.length > 0) {
      throw new ConflictException(`Ya existe un personaje con el alias ${alias}`);
    }
  }

  async checkTeam(teamId?: number) {
    if (!teamId) {
      return;
    }
    const res = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`El equipo con id ${teamId} no fue encontrado`);
    }
    if (!res.rows[0].active) {
      throw new BadRequestException('El equipo debe estar activo');
    }
  }

  checkStatus(actual: string, nuevo: string) {
    if (actual === 'RETIRED' && nuevo === 'INJURED') {
      throw new BadRequestException('Un personaje RETIRED no puede pasar a INJURED');
    }
  }
}
