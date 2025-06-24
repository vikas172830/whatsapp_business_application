import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { Status } from '../enum/status.enum';

@Table({})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  phone_no: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  username: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  about: string;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
  })
  status: Status;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  last_seen: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  profile_picture: string;
}
