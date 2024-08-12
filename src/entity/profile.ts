import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('datetime')
  createdAt: Date;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  notes: string | null;

  @Column('json')
  data: Record<string | number, any>;

  @Column('bigint')
  duration: bigint;

  constructor() {
    this.createdAt = new Date();
  }
}
