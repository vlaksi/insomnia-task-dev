import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionHash: string;

  @Index() // Optimizes time-based queries
  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Index() // Optimizes block number lookups
  @Column()
  blockNumber: number;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  amount: number;
}
