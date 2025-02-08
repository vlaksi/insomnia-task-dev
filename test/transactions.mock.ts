import { TransactionDto } from 'src/transactions/dto/transaction.dto';
import { Transaction } from 'src/transactions/entities/transactions.entity';

export const mockTransaction: Transaction = {
  id: '97914b9c-12b4-4ff3-90db-e8c5417bd628',
  transactionHash:
    '0xe4ede9e094a7e8473771131158eda853eda1cc5504700251750e520159e1541a',
  timestamp: new Date('2025-02-07T04:01:07.000Z'),
  blockNumber: 56953001,
  sender: '0x0393c6615a078e7697f5904FB8ca73F759355E93',
  receiver: '0x557d6fc3660c946Dee0D3510A27c1699e371fBAB',
  amount: 123.77,
};

export const mockTransactionsList: Transaction[] = [
  {
    id: '9db35fc3-d0eb-4808-aa5d-6af861aa0997',
    transactionHash:
      '0x3a163106306585728eb5e266cee44db64c116e1b86cc48b79fa4ffc0be553c59',
    timestamp: new Date('2025-02-07T06:31:15.000Z'),
    blockNumber: 56957499,
    sender: '0x3EF98543F9772DC959255545B717a61D408e7b61',
    receiver: '0x770F5F599301B61d7101637d9784ae6156726c18',
    amount: 100.0,
  },
  {
    id: '654a16be-a8da-447c-b05e-f63e26619074',
    transactionHash:
      '0x16f8fab3b518384c4b3b2ee5321e61bf996d88c03254e98c5d4fa3414cfcd1f1',
    timestamp: new Date('2025-02-07T06:31:14.000Z'),
    blockNumber: 56957498,
    sender: '0x802b65b5d9016621E66003aeD0b16615093f328b',
    receiver: '0xfAe3f424a0a47706811521E3ee268f00cFb5c45E',
    amount: 1416.367338,
  },
  {
    id: '11314968-b796-4547-aeae-a0dd120f8936',
    transactionHash:
      '0xf3d3750c220a359efcd23c872eae13ea420ef5a520bdc4bbc3d63797dc276c01',
    timestamp: new Date('2025-02-07T06:31:14.000Z'),
    blockNumber: 56957498,
    sender: '0x802b65b5d9016621E66003aeD0b16615093f328b',
    receiver: '0xa20c959b19F114e9C2D81547734CdC1110bd773D',
    amount: 1602.961965,
  },
];

export const mockLargestTransactionsList: Transaction[] = [
  {
    id: 'e3223f55-7628-4b91-b109-fe05cf34fe0e',
    transactionHash:
      '0x1c25a8f29f76229bfe1036400306f611b145cb936e5e971513cdf2986f8c4d0a',
    timestamp: new Date('2025-02-07T07:20:23.000Z'),
    blockNumber: 56959106,
    sender: '0x9f8c163cBA728e99993ABe7495F06c0A3c8Ac8b9',
    receiver: '0xABa2D404C5C41da5964453A368aFF2604Ae80A14',
    amount: 5432353.468252,
  },
  {
    id: 'e843b42a-79e1-48f6-becc-789626dd8644',
    transactionHash:
      '0x065774415c6a7b05574c39f43b9b40d0195d7eccb9e3eca8895fa134a1d4c096',
    timestamp: new Date('2025-02-07T07:00:23.000Z'),
    blockNumber: 56958436,
    sender: '0x9f8c163cBA728e99993ABe7495F06c0A3c8Ac8b9',
    receiver: '0x978B21a854dbEFcD6d51DFd269875d158046240b',
    amount: 4939921.07163,
  },
  {
    id: 'a25af9fa-7655-4ec1-a28a-a43df8009082',
    transactionHash:
      '0xf7bda3c82e480a2862e365582c9802a9e8e3208339ff83dc312d8ae1b81782ef',
    timestamp: new Date('2025-02-07T07:01:31.000Z'),
    blockNumber: 56958475,
    sender: '0x2823299af89285fF1a1abF58DB37cE57006FEf5D',
    receiver: '0xFc53E38B96c17bb7fDdC43bE0e4D3ebC781fdcED',
    amount: 2220028.493254,
  },
];

export const mockTransactionsDtoList: TransactionDto[] = [
  {
    transactionHash:
      '0xcd8eb726c9b999a49d08e3329e741a813213e487ae1e7e194a2b98e8ebc7ea74',
    timestamp: new Date('2025-02-07T13:45:58.000Z'),
    blockNumber: 56971470,
    sender: '0xD446eb1660F766d533BeCeEf890Df7A69d26f7d1',
    receiver: '0xc4F6a96846fcC8E773158e34d166a40B3Bc19898',
    amount: 3827.676567,
  },
  {
    transactionHash:
      '0xad8fdd54306a0d8dadbd5672d40e65c126659b6bc95ff17c2c9c80253394dd3f',
    timestamp: new Date('2025-02-07T13:45:57.000Z'),
    blockNumber: 56971469,
    sender: '0x804226cA4EDb38e7eF56D16d16E92dc3223347A0',
    receiver: '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
    amount: 12.508181,
  },
  {
    transactionHash:
      '0x63a13821ed8303f66f429221789c48bf626e2c6a79528b8a932fc2ce24895e09',
    timestamp: new Date('2025-02-07T13:45:54.000Z'),
    blockNumber: 56971466,
    sender: '0x88f15e36308ED060d8543DA8E2a5dA0810Efded2',
    receiver: '0x5C60f12838b8E3EEB525F299cD7C454c989dd04e',
    amount: 10.000509,
  },
];

export const mockPaginatedTransactions = {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
  transactions: mockTransactionsList,
};

export const totalTransferredUSDC = 1123456.78;

export const mockTopSenders = [
  {
    senderAddress: '0x9f8c163cBA728e99993ABe7495F06c0A3c8Ac8b9',
    total: 5541337.942806,
  },
  {
    senderAddress: '0xD446eb1660F766d533BeCeEf890Df7A69d26f7d1',
    total: 4789409.379719,
  },
  {
    senderAddress: '0x7E4aA755550152a522d9578621EA22eDAb204308',
    total: 2609298.413379,
  },
];

export const mockTopReceivers = [
  {
    receiverAddress: '0x9f8c163cBA728e99993ABe7495F06c0A3c8Ac8b9',
    total: 5541337.942806,
  },
  {
    receiverAddress: '0xD446eb1660F766d533BeCeEf890Df7A69d26f7d1',
    total: 4789409.379719,
  },
  {
    receiverAddress: '0x7E4aA755550152a522d9578621EA22eDAb204308',
    total: 2609298.413379,
  },
];
