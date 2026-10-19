import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../db.js';
import { AssignDto, TeamDto } from './team.dto.js';

@Injectable()
export class TeamsService {
  async findAll() {
    const res = await pool.query('SELECT * FROM teams ORDER BY id');
    return res.rows;
  }

  async findOne(id: number) {
    const res = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      throw new NotFoundException(`El equipo con id ${id} no fue encontrado`);
    }
    return res.rows[0];
  }

  async findCharacters(id: number) {
    await this.findOne(id);
    const res = await pool.query('SELECT * FROM characters WHERE team_id = $1 ORDER BY id', [id]);
    return res.rows;
  }

  async create(dto: TeamDto) {
    await this.checkName(dto.name);
    const ids = dto.characterIds || [];
    if (ids.length > 0) {
      await this.checkCharacters(ids);
      if (dto.active === false) {
        throw new BadRequestException('El equipo debe estar activo');
      }
    }
    const res = await pool.query(
      'INSERT INTO teams (name, base, founded_year, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [dto.name, dto.base ?? null, dto.founded_year ?? null, dto.active ?? true],
    );
    const team = res.rows[0];
    for (const characterId of ids) {
      await pool.query('UPDATE characters SET team_id = $1, updated_at = NOW() WHERE id = $2', [team.id, characterId]);
    }
    return team;
  }

  async update(id: number, dto: TeamDto) {
    await this.findOne(id);
    await this.checkName(dto.name, id);
    const res = await pool.query(
      'UPDATE teams SET name = $1, base = $2, founded_year = $3, active = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [dto.name, dto.base ?? null, dto.founded_year ?? null, dto.active ?? true, id],
    );
    return res.rows[0];
  }

  async assign(id: number, dto: AssignDto) {
    const team = await this.findOne(id);
    await this.checkCharacters(dto.characterIds);
    if (!team.active) {
      throw new BadRequestException('El equipo debe estar activo');
    }
    for (const characterId of dto.characterIds) {
      await pool.query('UPDATE characters SET team_id = $1, updated_at = NOW() WHERE id = $2', [id, characterId]);
    }
    return this.findCharacters(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const res = await pool.query('SELECT id FROM characters WHERE team_id = $1', [id]);
    if (res.rows.length > 0) {
      throw new ConflictException('El equipo tiene personajes asociados');
    }
    await pool.query('DELETE FROM teams WHERE id = $1', [id]);
  }

  async checkName(name: string, id = 0) {
    const res = await pool.query('SELECT id FROM teams WHERE name = $1 AND id <> $2', [name, id]);
    if (res.rows.length > 0) {
      throw new ConflictException(`Ya existe un equipo con el nombre ${name}`);
    }
  }

  async checkCharacters(ids: number[]) {
    for (const id of ids) {
      const res = await pool.query('SELECT id FROM characters WHERE id = $1', [id]);
      if (res.rows.length === 0) {
        throw new NotFoundException(`El personaje con id ${id} no fue encontrado`);
      }
    }
  }
}
