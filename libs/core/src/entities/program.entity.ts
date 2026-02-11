import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";
import {
  ProgramStatus,
  Language,
  Provider,
  ProgramCategory,
} from "../enums/program.enums";
import { ProviderMetadata } from "../interfaces/provider-metadata.interface";

@Entity("programs")
@Index(["status", "created_at"])
@Index(["language", "status"], { where: '"deleted_at" IS NULL' })
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int", default: 0 })
  duration_seconds!: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  category?: ProgramCategory;

  @Column({ type: "varchar", length: 500, nullable: true })
  thumbnail_url?: string;

  @Column({ type: "varchar", length: 20, default: "DRAFT" })
  status!: ProgramStatus;

  @Column({ type: "timestamp", nullable: true })
  published_at?: Date;

  @Exclude()
  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;

  @Exclude()
  @Column({ type: "tsvector", nullable: true })
  search_vector?: string;

  @Column({ type: "varchar", length: 10, default: "ar-SA" })
  language!: Language;

  @Expose({ groups: ["admin"] })
  @Column({ type: "varchar", length: 50, nullable: true })
  source_provider?: Provider;

  @Expose({ groups: ["admin"] })
  @Column({ type: "varchar", length: 255, nullable: true })
  external_id?: string;

  @Expose({ groups: ["admin"] })
  @Column({ type: "jsonb", default: {} })
  source_metadata!: ProviderMetadata;

  @Column({ type: "timestamp", default: () => "NOW()" })
  created_at!: Date;

  @Column({ type: "timestamp", default: () => "NOW()" })
  updated_at!: Date;
}
