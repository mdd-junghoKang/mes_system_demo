from datetime import datetime

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str] = mapped_column(String(255))


class BedrockDetection(Base):
    __tablename__ = "bedrock_detections"

    id: Mapped[int] = mapped_column(primary_key=True)
    get_date: Mapped[str] = mapped_column(String(10))
    get_time: Mapped[str] = mapped_column(String(6))
    area_cm: Mapped[float]
    warning_level: Mapped[str] = mapped_column(String(10))
    origin_img_file_path: Mapped[str] = mapped_column(String(255), default="")
    result_img_file_path: Mapped[str] = mapped_column(String(255), default="")


class Lot(Base):
    __tablename__ = "lots"

    id: Mapped[int] = mapped_column(primary_key=True)
    work_date: Mapped[str] = mapped_column(String(10))
    lot_no: Mapped[str] = mapped_column(String(50), unique=True)
    mix_no: Mapped[str] = mapped_column(String(50))
    item_cd: Mapped[str] = mapped_column(String(50))
    item_nm: Mapped[str] = mapped_column(String(100))
    order_no: Mapped[str] = mapped_column(String(50))
    color_quality: Mapped[str] = mapped_column(String(20))
    curing_log: Mapped[str] = mapped_column(String(20))
    appearance_quality: Mapped[str] = mapped_column(String(20))
    finished_lot: Mapped[str] = mapped_column(String(20))


class AggregateLine(Base):
    __tablename__ = "aggregate_lines"

    line_info: Mapped[str] = mapped_column(String(20), primary_key=True)
    agg_info: Mapped[str] = mapped_column(String(20))
    use_yn: Mapped[str] = mapped_column(String(1), default="Y")


class AggregateMeasurement(Base):
    __tablename__ = "aggregate_measurements"

    id: Mapped[int] = mapped_column(primary_key=True)
    line_info: Mapped[str] = mapped_column(String(20))
    batch_no: Mapped[str] = mapped_column(String(30))
    lot_no: Mapped[str | None] = mapped_column(String(50))
    gathering_time: Mapped[datetime] = mapped_column(DateTime)
    a_value: Mapped[float]
    p_value: Mapped[float]
    pass_00_15: Mapped[float]
    pass_00_30: Mapped[float]
    pass_00_60: Mapped[float]
    pass_01_20: Mapped[float]
    pass_02_25: Mapped[float]
    pass_05_00: Mapped[float]
    pass_10_00: Mapped[float]


class SemiProductInspection(Base):
    __tablename__ = "semi_product_inspections"

    id: Mapped[int] = mapped_column(primary_key=True)
    get_date: Mapped[str] = mapped_column(String(10))
    get_time: Mapped[str] = mapped_column(String(8))
    data_name: Mapped[str] = mapped_column(String(50))
    item_cd: Mapped[str] = mapped_column(String(50))
    item_nm: Mapped[str] = mapped_column(String(100))
    lot_no: Mapped[str] = mapped_column(String(50))
    result: Mapped[str] = mapped_column(String(10))
    img_path: Mapped[str] = mapped_column(String(255), default="")
    color_data: Mapped[str] = mapped_column(String(255), default="")
    defect_data: Mapped[str] = mapped_column(String(255), default="")
    item_gn: Mapped[str | None] = mapped_column(String(50))
    item_sn: Mapped[str | None] = mapped_column(String(50))
    cycle_id: Mapped[str | None] = mapped_column(String(50))
    cycle_state: Mapped[str | None] = mapped_column(String(10))


class ProductInspection(Base):
    __tablename__ = "product_inspections"

    id: Mapped[int] = mapped_column(primary_key=True)
    get_date: Mapped[str] = mapped_column(String(10))
    get_time: Mapped[str] = mapped_column(String(8))
    lot_no: Mapped[str] = mapped_column(String(50))
    item_cd: Mapped[str] = mapped_column(String(50))
    item_nm: Mapped[str] = mapped_column(String(100))
    origin_img_file_path: Mapped[str] = mapped_column(String(255), default="")
    result: Mapped[str] = mapped_column(String(10), default="OK")


class MaterialBatchEntry(Base):
    __tablename__ = "material_batch_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime)
    lot_no: Mapped[str | None] = mapped_column(String(50))
    gubun: Mapped[str] = mapped_column(String(20))
    mat_name: Mapped[str] = mapped_column(String(50))
    set_qty: Mapped[float]
    act_qty: Mapped[float]


class ProductionSnapshot(Base):
    __tablename__ = "production_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime)
    play_yn: Mapped[str] = mapped_column(String(1))
    height_ref: Mapped[float | None]
    product_no: Mapped[str] = mapped_column(String(50))
    product_name: Mapped[str] = mapped_column(String(100))
    cycle_count: Mapped[int]
    mold_no: Mapped[str] = mapped_column(String(50))
    mold_name: Mapped[str] = mapped_column(String(100))
    cycle_time_raw: Mapped[float]
    press_time_raw: Mapped[float]
    weight: Mapped[float]
    zone_thickness: Mapped[dict] = mapped_column(JSON, default=dict)
    motion_speeds: Mapped[dict] = mapped_column(JSON, default=dict)
    lot_no: Mapped[str | None] = mapped_column(String(50))
    item_cd: Mapped[str | None] = mapped_column(String(50))
    order_no: Mapped[str | None] = mapped_column(String(50))


class CuringLog(Base):
    __tablename__ = "curing_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    lot_no: Mapped[str] = mapped_column(String(50))
    recorded_at: Mapped[datetime] = mapped_column(DateTime)
    zone_1: Mapped[float]
    zone_2: Mapped[float]
    zone_3: Mapped[float]
    zone_4: Mapped[float]
    zone_5: Mapped[float]
    zone_6: Mapped[float]


class QualityMeasurement(Base):
    __tablename__ = "quality_measurements"

    id: Mapped[int] = mapped_column(primary_key=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime)
    item_nm: Mapped[str] = mapped_column(String(100))
    height_1_avg: Mapped[float]
    height_2_avg: Mapped[float]
    height_3_avg: Mapped[float]
    weight: Mapped[float]
    cycle_time: Mapped[float]
    press_time: Mapped[float]
