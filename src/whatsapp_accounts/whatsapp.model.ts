import { Column, DataType, Model, PrimaryKey } from 'sequelize-typescript';
import { Table } from 'sequelize-typescript';

@Table({})
export class whatsapp_accounts extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

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
