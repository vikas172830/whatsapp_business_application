import { Column, DataType, Model } from 'sequelize-typescript';
import { Table } from 'sequelize-typescript';

@Table({})
export class whatsapp_accounts extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  waba_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  business_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  access_token: string;
}
