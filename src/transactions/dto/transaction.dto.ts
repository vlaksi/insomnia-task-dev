import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ description: 'Transaction Hash', example: '0x123abc...' })
  transactionHash: string;

  @ApiProperty({ description: 'Block Number', example: 12345678 })
  blockNumber: number;

  @ApiProperty({
    description: 'Block Timestamp (UTC)',
    example: '2025-02-06T10:43:58.000Z',
  })
  timestamp: Date;

  @ApiProperty({ description: 'Transaction Index within Block', example: 5 })
  transactionIndex: number;

  @ApiProperty({ description: 'Sender Address', example: '0xABCDEF123456...' })
  sender: string;

  @ApiProperty({
    description: 'Receiver Address',
    example: '0xFEDCBA654321...',
  })
  receiver: string;

  @ApiProperty({ description: 'Amount Transferred in USDC', example: '150.00' })
  amount: number;
}
