from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.attendance_service import (
    bulk_mark_attendance,
    get_attendance_by_date_and_class,
    get_attendance_history,
    get_attendance_stats,
)
from utils.dependencies import get_current_user, get_current_school_id

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ✅ Single attendance — frontend /attendance/ par POST karta hai
class SingleAttendance(BaseModel):
    student_id: int
    date: str
    status: str
    marked_by: Optional[int] = None   # ✅ frontend bhej raha hai, is liye optional rakha


class AttendanceItem(BaseModel):
    student_id: int
    date: str
    status: str


class BulkAttendanceRequest(BaseModel):
    records: List[AttendanceItem]


@router.post("/")
def mark_single(
    record: SingleAttendance,
    current_user: dict = Depends(get_current_user),
    school_id: int = Depends(get_current_school_id)
):
    """Single student ki attendance mark karo."""
    marked_by = (
        record.marked_by
        or current_user.get("id")
        or current_user.get("user_id")
    )
    return bulk_mark_attendance([record.dict()], marked_by, school_id)


@router.post("/bulk")
def mark_bulk(
    request: BulkAttendanceRequest,
    current_user: dict = Depends(get_current_user),
    school_id: int = Depends(get_current_school_id)
):
    """Multiple students ki attendance ek saath mark karo."""
    records = [r.dict() for r in request.records]
    marked_by = current_user.get("id") or current_user.get("user_id")
    return bulk_mark_attendance(records, marked_by, school_id)


@router.get("/date/{date}/class/{class_id}")
def get_by_date_class(
    date: str,
    class_id: int,
    section_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
    school_id: int = Depends(get_current_school_id)
):
    return get_attendance_by_date_and_class(date, class_id, school_id, section_id)


@router.get("/history/{student_id}")
def get_history(
    student_id: int,
    limit: int = 30,
    current_user: dict = Depends(get_current_user),
    school_id: int = Depends(get_current_school_id)
):
    return get_attendance_history(student_id, school_id, limit)


@router.get("/stats/{date}")
def get_stats(
    date: str,
    current_user: dict = Depends(get_current_user),
    school_id: int = Depends(get_current_school_id)
):
    return get_attendance_stats(date, school_id)