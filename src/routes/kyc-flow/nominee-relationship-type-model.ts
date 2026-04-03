import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class NominineeRelationshipType extends Model {
    declare id: CreationOptional<number>
    declare mfu_code: string
    declare relationship: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof NominineeRelationshipType {
        NominineeRelationshipType.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            mfu_code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            relationship: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            sequelize,
            freezeTableName: true,
        });

        return NominineeRelationshipType;
    }
}
