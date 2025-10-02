import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, X, Car } from 'lucide-react';

// Memoized calendar day component for better performance
const CalendarDay = memo(({ date, appointments, isCurrentMonthDay, isTodayDate, isSelected, onClick }) => (
    <div
        className={`
      relative text-center py-2 px-1 cursor-pointer rounded-lg transition-colors duration-150
      ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
      ${isTodayDate ? 'bg-blue-500 text-white font-bold border-2 border-blue-600' : ''}
      ${isSelected && !isTodayDate ? 'bg-gray-100 border border-gray-300' : ''}
      hover:bg-gray-50
    `}
        onClick={() => onClick(date)}
    >
        <div className="text-sm font-medium">
            {date.getDate()}
        </div>

        {/* Appointment indicator */}
        {appointments.length > 0 && (
            <div className="absolute -top-1 -right-1">
                <div className={`
          text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center
          ${isTodayDate ? 'bg-white text-blue-600 border border-blue-200' : 'bg-blue-500 text-white'}
        `}>
                    {appointments.length}
                </div>
            </div>
        )}
    </div>
));

const CompactCalendar = ({
    allBookings = [],
    onDateClick,
    onScheduleNew,
    onAppointmentClick
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAppointmentList, setShowAppointmentList] = useState(false);
    const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
    const [clickedDate, setClickedDate] = useState(null);

    // Memoize calendar data for current month
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    }, [currentDate]);

    // Memoize appointments map for faster lookups
    const appointmentsMap = useMemo(() => {
        const map = new Map();
        allBookings.forEach(booking => {
            const date = booking.preferredDate;
            if (!map.has(date)) map.set(date, []);
            map.get(date).push(booking);
        });
        return map;
    }, [allBookings]);

    // Fast appointment lookup
    const getAppointmentsForDate = useCallback((date) => {
        // Use local date formatting to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return appointmentsMap.get(dateString) || [];
    }, [appointmentsMap]);

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Check if date is current month
    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    // Navigate months
    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    // Memoized handlers for better performance
    const handleDateClick = useCallback((date) => {
        setSelectedDate(date);
        const appointments = getAppointmentsForDate(date);

        if (appointments.length === 0) {
            onDateClick?.(date, appointments);
        } else if (appointments.length === 1) {
            onAppointmentClick?.(appointments[0]);
        } else {
            setSelectedDateAppointments(appointments);
            setClickedDate(date);
            setShowAppointmentList(true);
        }
    }, [getAppointmentsForDate, onDateClick, onAppointmentClick]);

    const handleAppointmentClick = useCallback((appointment) => {
        setShowAppointmentList(false);
        onAppointmentClick?.(appointment);
    }, [onAppointmentClick]);

    const closeAppointmentList = useCallback(() => {
        setShowAppointmentList(false);
        setSelectedDateAppointments([]);
        setClickedDate(null);
    }, []);

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    const todayAppointments = getAppointmentsForDate(new Date());

    return (
        <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Calendar</CardTitle>
                            <CardDescription className="text-sm text-gray-600 font-medium">
                                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth(-1)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 p-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth(1)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 p-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {/* Month/Year Header */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(currentDate)}
                    </h3>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center py-2 text-xs font-medium text-gray-500">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((date) => {
                        const appointments = getAppointmentsForDate(date);
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);
                        const isSelected = selectedDate.toDateString() === date.toDateString();

                        return (
                            <CalendarDay
                                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                                date={date}
                                appointments={appointments}
                                isCurrentMonthDay={isCurrentMonthDay}
                                isTodayDate={isTodayDate}
                                isSelected={isSelected}
                                onClick={handleDateClick}
                            />
                        );
                    })}
                </div>

                {/* Summary and Action */}
                <div className="space-y-4">
                    {/* Summary line */}
                    <div className="text-center">
                        {todayAppointments.length === 0 ? (
                            <p className="text-sm text-gray-600 font-medium">
                                No appointments scheduled for today.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 font-medium">
                                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled today.
                            </p>
                        )}
                    </div>

                    {/* Primary action button */}
                    <Button
                        onClick={onScheduleNew}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule New Appointment
                    </Button>
                </div>

            </CardContent>

            {/* Appointment List Modal */}
            {showAppointmentList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                                <p className="text-sm text-gray-600">
                                    {clickedDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={closeAppointmentList}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-2">
                                {selectedDateAppointments.map((appointment, index) => (
                                    <div
                                        key={appointment.id || index}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleAppointmentClick(appointment)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Car className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {appointment.customerName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {appointment.preferredTime} • {appointment.serviceType}
                                                </p>
                                            </div>
                                            <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${appointment.bookingStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : ''}
                        ${appointment.bookingStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                        ${appointment.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                                                {appointment.bookingStatus}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">
                                Click on any appointment to view details
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CompactCalendar;
