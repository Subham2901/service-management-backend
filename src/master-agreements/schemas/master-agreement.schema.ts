import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Automatically add createdAt and updatedAt
export class MasterAgreement extends Document {
  @Prop({ required: true, unique: true }) // Ensure agreementId is unique
  agreementId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  validFrom: Date;

  @Prop({ required: true })
  validUntil: Date;

  @Prop({
    required: true,
    enum: ['open', 'closed'],
    message: 'Invalid status. Must be open or closed.',
  }) // Restrict status to valid values
  status: string;
}

// Create the schema
export const MasterAgreementSchema = SchemaFactory.createForClass(MasterAgreement);

// Indexing for faster queries
MasterAgreementSchema.index({ agreementId: 1 });
MasterAgreementSchema.index({ status: 1 });
MasterAgreementSchema.index({ validFrom: 1 });
MasterAgreementSchema.index({ validUntil: 1 });

// Middleware to validate validFrom and validUntil
MasterAgreementSchema.pre('save', function (next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error('validFrom must be earlier than validUntil'));
  } else {
    next();
  }
});
