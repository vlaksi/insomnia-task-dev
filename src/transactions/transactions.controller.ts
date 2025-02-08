import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('USDC Transactions')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('/total-transferred')
  @ApiOperation({
    summary: 'Get total USDC transferred in a given time interval',
    description:
      'Fetches the total amount of USDC transferred within the given time period (in minutes).',
  })
  @ApiQuery({
    name: 'interval',
    type: Number,
    required: true,
    description: 'Time period in minutes (e.g., 5, 10, 30, 40, 60, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the total USDC transferred in the given interval.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid interval value.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - Unexpected failure while fetching data.',
  })
  async getTotalTransferred(@Query('interval') interval: string) {
    try {
      const parsedInterval = parseInt(interval, 10);
      if (isNaN(parsedInterval) || parsedInterval <= 0 || parsedInterval < 5) {
        throw new BadRequestException(
          'Invalid interval. Must be a positive number greater or equal to 5.',
        );
      }

      const totalUSDC =
        await this.transactionsService.getTotalTransferred(parsedInterval);

      return { totalUSDC };
    } catch (error: unknown) {
      this.logger.error('Failed to fetch total transferred USDC', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching total USDC transferred.',
      );
    }
  }

  @Get('top-sender-accounts')
  @ApiOperation({
    summary: 'Get Top 10 Sender Accounts',
    description:
      'Retrieves the top 10 accounts that have highest total amount sent. The response includes the sender address and the total amount sent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the top 10 sender accounts.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failed to fetch top sender accounts.',
  })
  async getTopSenderAccounts() {
    try {
      const topSenders = await this.transactionsService.getTopSenderAccounts();

      if (!topSenders || topSenders.length === 0) {
        return { message: 'No sender accounts found.' };
      }

      return topSenders;
    } catch (error: unknown) {
      this.logger.error('Failed to fetch top sender accounts', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching top sender accounts.',
      );
    }
  }

  @Get('top-receiver-accounts')
  @ApiOperation({
    summary: 'Get Top 10 Receiver Accounts',
    description:
      'Retrieves the top 10 accounts that have highest total amount received. The response includes the receiver address and the total amount received.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the top 10 receiver accounts.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - Failed to fetch top receiver accounts.',
  })
  async getTopReceiverAccounts() {
    try {
      const topReceivers =
        await this.transactionsService.getTopReceiverAccounts();

      if (!topReceivers || topReceivers.length === 0) {
        return { message: 'No receiver accounts found.' };
      }

      return topReceivers;
    } catch (error: unknown) {
      this.logger.error('Failed to fetch top receiver accounts', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching top receiver accounts.',
      );
    }
  }

  @Get('paginated')
  @ApiOperation({
    summary: 'Get paginated transactions',
    description:
      'Fetches a paginated list of transactions, ordered by timestamp in descending order.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of transactions per page (default: 10, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'Returns paginated transactions' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPaginatedTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const parsedPage = Number(page);
      let parsedLimit = Number(limit);

      if (
        isNaN(parsedPage) ||
        isNaN(parsedLimit) ||
        parsedPage < 1 ||
        parsedLimit < 1
      ) {
        throw new BadRequestException(
          'Page and limit must be positive integers.',
        );
      }

      if (parsedLimit > 100) {
        parsedLimit = 100;
      }

      return await this.transactionsService.getPaginatedTransactions(
        parsedPage,
        parsedLimit,
      );
    } catch (error: unknown) {
      this.logger.error('Failed to fetch paginated transactions', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching paginated transactions.',
      );
    }
  }

  @Get('largest')
  @ApiOperation({ summary: 'Get largest transactions' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description:
      'Number of largest transactions to return (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the largest transactions sorted by amount.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid limit value.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getLargestTransactions(@Query('limit') limit: string) {
    try {
      let parsedLimit = parseInt(limit, 10);

      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new BadRequestException('Limit must be a positive integer.');
      }

      if (parsedLimit > 100) {
        parsedLimit = 100;
      }

      return await this.transactionsService.getLargestTransactions(parsedLimit);
    } catch (error: unknown) {
      this.logger.error('Failed to fetch largest transactions', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching largest transactions.',
      );
    }
  }

  @Get(':hash')
  @ApiOperation({ summary: 'Get transaction details by hash' })
  @ApiParam({
    name: 'hash',
    required: true,
    description: 'Transaction hash to fetch details',
    example:
      '0x805fd751b9db9923985ae916b8319cecd9a9226e55f3282ee281b5cee606e5c1',
  })
  @ApiResponse({ status: 200, description: 'Returns the transaction details.' })
  @ApiResponse({ status: 400, description: 'Invalid transaction hash format.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getTransactionByHash(@Param('hash') hash: string) {
    try {
      if (!hash || hash.length !== 66) {
        throw new BadRequestException('Invalid transaction hash format.');
      }

      const transaction =
        await this.transactionsService.getTransactionByHash(hash);

      if (!transaction) {
        throw new NotFoundException('Transaction not found.');
      }

      return transaction;
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch transaction details.',
      );
    }
  }
}
