import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('datetime')
  createdAt: Date;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column('json')
  data: string;

  @Column('int')
  duration: number;

  constructor() {
    this.createdAt = new Date();
  }
}
