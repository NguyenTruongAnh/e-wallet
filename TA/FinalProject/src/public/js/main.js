// ***** Trang Login *****


// ***** Trang Register *****


// ***** Trang Reset Password *****


// ***** Trang Recovery *****
if (document.querySelector('.recovery')) {
    const recoveryForm = document.getElementById("recovery-submit-form")

    recoveryForm.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (recoveryForm.checkValidity() === false) {
            recoveryForm.classList.add('was-validated')
        } else {
            recoveryForm.classList.remove('was-validated')
            const phone = $('#recovery-phone').val()

            if (checkPhoneNumber(phone)) {
                $('#invalid-recovery-phone').addClass('d-none');

                recoveryForm.submit()
            } else {
                $('#invalid-recovery-phone').removeClass('d-none');
            }

        }
    }, false)
}

// ***** Trang Recovery2 *****
if (document.querySelector('.recovery2')) {
    const recovery2FormOTP = document.getElementById("recovery2-submit-form-otp")
    const recovery2FormPassword = document.getElementById("recovery2-submit-form-password")
    const recovery2ModalMessage = $('#recovery2-modal-message')
    const recovery2ModalBodyMessage = $('#recovery2-modal-body__message')
    let recovery2Redirect = ''

    recovery2FormOTP.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (recovery2FormOTP.checkValidity() === false) {
            recovery2FormOTP.classList.add('was-validated')
        } else {
            recovery2FormOTP.classList.remove('was-validated')

            const otpCode = $('#otp-code').val()

            $.ajax({
                url: "http://localhost:3000/recovery2-otp",
                type: "POST",
                data: { otpCode: otpCode },
                async: false,
                success: function (result) {
                    if (result.code === 0) {
                        $('#otp-code').attr('disabled', true)
                        $('#recovery2-submit-form-otp .btn').addClass('d-none')
                        recovery2FormPassword.classList.remove('d-none')
                    } else {
                        recovery2ModalBodyMessage.html(result.message)
                        recovery2ModalMessage.modal('show')
                    }

                    if (result.code === 2) {
                        recovery2Redirect = "http://localhost:3000/recovery"
                    }
                }
            })
        }
    }, false)

    recovery2FormPassword.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (recovery2FormPassword.checkValidity() === false) {
            recovery2FormPassword.classList.add('was-validated')
        } else {
            recovery2FormPassword.classList.add('was-validated')

            const newPassword = $('#new-password').val()
            const confirmPassword = $('#confirm-password').val()

            if (newPassword === confirmPassword) {
                $('#invalid-recovery2-confirm-password').addClass('d-none')

                $.ajax({
                    url: "http://localhost:3000/recovery2-password",
                    type: "POST",
                    data: { newPassword: newPassword, confirmPassword: confirmPassword },
                    async: false,
                    success: function (result) {
                        if (result.code === 0) {
                            recovery2Redirect = "http://localhost:3000/login"
                        }

                        recovery2ModalBodyMessage.html(result.message)
                        recovery2ModalMessage.modal('show')
                    }
                })
            } else {
                $('#invalid-recovery2-confirm-password').removeClass('d-none')
            }
        }
    }, false)

    recovery2ModalMessage.on('hidden.bs.modal', function () {
        if (recovery2Redirect) {
            window.location.href = recovery2Redirect
        }
    })
}


// ------------------ User ------------------
// ***** Trang Profile *****
if (document.querySelector('.user-profile')) {
    if (document.getElementById("user-profile__submit-form")) {
        const userProfileForm = document.getElementById("user-profile__submit-form")
        const userProfileFileInput1 = document.getElementById('user-profile__form-file1')
        const userProfileFileInput2 = document.getElementById('user-profile__form-file2')
        const userProfileImageView1 = document.getElementById('user-profile__form-view1')
        const userProfileImageView2 = document.getElementById('user-profile__form-view2')

        const profileModalMessage = $('#profile-modal-message')
        const profileModalBodyMessage = $('#profile-modal-body__message')

        let isProfileUpdateSuccess = false

        userProfileForm.addEventListener('submit', function (event) {
            event.preventDefault()
            event.stopPropagation()
            if (userProfileForm.checkValidity() === false) {
                userProfileForm.classList.add('was-validated')
            } else {
                userProfileForm.classList.remove('was-validated')

                const idphoto1 = userProfileFileInput1.files[0]
                const idphoto2 = userProfileFileInput2.files[0]

                const formData = new FormData()

                formData.append('idphoto1', idphoto1)
                formData.append('idphoto2', idphoto2)

                $.ajax({
                    url: 'http://localhost:3000/profile-update',
                    data: formData,
                    processData: false,
                    contentType: false,
                    type: 'PUT',
                    success: function (result) {
                        if (result.code === 0) {
                            userProfileForm.classList.add('d-none')
                            isProfileUpdateSuccess = true
                        }

                        profileModalBodyMessage.html(result.message)
                        profileModalMessage.modal('show')
                    }
                })
            }
        }, false)

        profileModalMessage.on('hidden.bs.modal', function () {
            if (isProfileUpdateSuccess) {
                window.location.reload()
            }
        })

        // Sự kiện thêm ảnh mặt trước
        userProfileFileInput1.addEventListener('change', function (e) {
            if (userProfileFileInput1.files.lenght !== 0) {
                const file = e.target.files[0]
                const reader = new FileReader()

                reader.onload = function (e) {
                    userProfileImageView1.setAttribute('src', e.target.result)
                }

                reader.readAsDataURL(file)
            }
        })

        // Sự kiện thêm ảnh mặt sau
        userProfileFileInput2.addEventListener('change', function (e) {
            if (userProfileFileInput2.files.lenght !== 0) {
                const file = e.target.files[0]
                const reader = new FileReader()

                reader.onload = function (e) {
                    userProfileImageView2.setAttribute('src', e.target.result)
                }

                reader.readAsDataURL(file)
            }
        })
    }
}

// ***** Trang Transactions *****


// ***** Trang Detail Transaction *****


// ***** Trang Deposit *****


// ***** Trang Withdraw *****
if (document.querySelector('.user-withdraw')) {
    const userWithdrawForm = document.getElementById("user-withdraw__form")
    const userWithdrawInputCardId = $('#user-withdraw__form-card-id')
    const userWithdrawInputCardCVV = $('#user-withdraw__form-card-cvv')
    const userWithdrawInputDate = $('#user-withdraw__form-card-date')
    const userWithdrawInputMoney = $('#user-withdraw__form-money')
    const userWithdrawInputNote = $('#user-withdraw__form-note')
    const userWithdrawFee = $('#user-withdraw__form-fee')
    const userWithdrawBtn = $('#user-withdraw__form-btn')

    const userWithdrawLoader = $('#user-withdraw__form-loader')

    const withdrawModalMessage = $('#withdraw-modal-message')
    const withdrawModalBodyMessage = $('#withdraw-modal-body__message')

    let checkUserWithdrawCardId = false // Cờ kiểm tra số thẻ đúng định dạng chưa trước khi submit
    let checkUserWithdrawCardCVV = false
    let checkUserWithdrawMoney = false

    // Sự kiện gửi form lên
    userWithdrawForm.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (userWithdrawForm.checkValidity() === false) {
            userWithdrawForm.classList.add('was-validated')
        } else {
            userWithdrawForm.classList.remove('was-validated')

            if (checkUserWithdrawCardId && checkUserWithdrawCardCVV && checkUserWithdrawMoney) {
                // Bật nút loader lên và ẩn nút gửi đi
                userWithdrawBtn.addClass('d-none')
                userWithdrawLoader.removeClass('d-none')
                userWithdrawLoader.addClass('d-flex')

                // Set timeout để có thời gian để thực hiện biến đổi giao diện
                setTimeout(function () {
                    const cardId = userWithdrawInputCardId.val()
                    const cardCVV = userWithdrawInputCardCVV.val()
                    const amount = parseInt(userWithdrawInputMoney.val())
                    const expiredDate = userWithdrawInputDate.val()
                    const note = userWithdrawInputNote.val()
                    const fee = amount * 0.05

                    const withdrawData = {
                        cardId,
                        cardCVV,
                        amount,
                        expiredDate,
                        fee,
                        note
                    }

                    $.ajax({
                        url: "http://localhost:3000/withdraw",
                        type: "POST",
                        data: withdrawData,
                        async: false,
                        success: function (result) {
                            userWithdrawBtn.removeClass('d-none')
                            userWithdrawLoader.addClass('d-none')
                            userWithdrawLoader.removeClass('d-flex')

                            if (result.code !== 1) {
                                userWithdrawForm.reset()
                                userWithdrawFee.text(`0đ`)
                            }

                            withdrawModalBodyMessage.html(result.message)
                            withdrawModalMessage.modal('show')
                        }
                    })
                }, 1000)
            }
        }
    }, false)

    // Bắt sự kiện thay đổi của thẻ input Số thẻ
    userWithdrawInputCardId.change(function () {
        const value = parseInt(userWithdrawInputCardId.val())

        if (!value || value < 100000 || value > 999999) {
            $('#user-withdraw__form-card-id-invalid').removeClass('d-none')
            checkUserWithdrawCardId = false
        } else {
            $('#user-withdraw__form-card-id-invalid').addClass('d-none')
            checkUserWithdrawCardId = true
        }
    })

    // Bắt sự kiện thay đổi của thẻ input Mã CVV
    userWithdrawInputCardCVV.change(function () {
        const value = parseInt(userWithdrawInputCardCVV.val())

        if (!value || value < 100 || value > 999) {
            $('#user-withdraw__form-card-cvv-invalid').removeClass('d-none')
            checkUserWithdrawCardCVV = false
        } else {
            $('#user-withdraw__form-card-cvv-invalid').addClass('d-none')
            checkUserWithdrawCardCVV = true
        }
    })

    // Bắt sự kiện số tiền nạp thay đổi
    userWithdrawInputMoney.change(function () {
        const value = parseInt(userWithdrawInputMoney.val())

        if (!value || value < 50000 || (value % 50000 !== 0)) {
            $('#user-withdraw__form-money-invalid').removeClass('d-none')
            checkUserWithdrawMoney = false
        } else {
            $('#user-withdraw__form-money-invalid').addClass('d-none')
            checkUserWithdrawMoney = true

            // Tính phí rút tiền 
            userWithdrawFee.text(`${formatMoney(value * 0.05)}đ`)
        }
    })
}

// ***** Trang Transfer *****
if (document.querySelector('.user-transfer')) {
    const userTransferInfoForm = document.getElementById("user-transfer__form-info")

    const userTransferInfoInputPhone = $('#user-transfer__form-info-phone')
    const userTransferInfoInputMoney = $('#user-transfer__form-info-money')
    const userTransferInfoInputNote = $('#user-transfer__form-info-note')
    const userTransferInfoFee = $('#user-transfer__form-info-fee')
    const userTransferInfoBtn = $('#user-transfer__form-info-btn')

    const userTransferInfoLoader = $('#user-transfer__form-info-loader')

    const transferModalMessage = $('#transfer-modal-message')
    const transferModalBodyMessage = $('#transfer-modal-body__message')

    let userTransferInfoPhone = false // Dùng kiểm tra phone hợp lệ chưa
    let userTransferInfoMoney = false // Dùng kiểm tra số tiền có hợp lệ chưa

    const userTransferConfirmForm = document.getElementById("user-transfer__form-confirm")

    let transferTransactionId
    let isReloadTransferPage = false

    //* Xử lý Form Info */
    // Sự kiện gửi form lên
    userTransferInfoForm.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (userTransferInfoForm.checkValidity() === false) {
            userTransferInfoForm.classList.add('was-validated')
        } else {
            userTransferInfoForm.classList.remove('was-validated')

            if (userTransferInfoPhone && userTransferInfoMoney) {
                // Bật nút loader lên và ẩn nút gửi đi
                userTransferInfoLoader.removeClass('d-none')
                userTransferInfoLoader.addClass('d-flex')
                userTransferInfoBtn.addClass('d-none')

                // Set timeout để có thời gian để thực hiện biến đổi giao diện
                setTimeout(function () {
                    const receiverPhone = userTransferInfoInputPhone.val()
                    const amount = parseInt(userTransferInfoInputMoney.val())
                    const note = userTransferInfoInputNote.val()
                    const whoPayFee = $('#user-transfer__form-info-checked').is(':checked') ? 1 : 0
                    const fee = amount * 0.05

                    const transferData = {
                        receiverPhone,
                        amount,
                        note,
                        whoPayFee,
                        fee
                    }

                    $.ajax({
                        url: "http://localhost:3000/transfer",
                        type: "POST",
                        data: transferData,
                        async: false,
                        success: function (result) {
                            userTransferInfoLoader.removeClass('d-flex')
                            userTransferInfoLoader.addClass('d-none')
                            userTransferInfoBtn.removeClass('d-none')

                            // Trường hợp gửi thành công
                            if (result.code === 0) {
                                // Vô hiệu việc nhập các trường sđt, số tiền chuyển, note và checkbox
                                // Ẩn nút xác nhận
                                // Hiển thị tên người được nhận và nút chuyển tiền
                                userTransferInfoBtn.addClass('d-none')
                                userTransferConfirmForm.classList.remove('d-none')
                                userTransferInfoInputPhone.attr('readonly', true)
                                userTransferInfoInputMoney.attr('readonly', true)
                                userTransferInfoInputNote.attr('readonly', true)
                                $('#user-transfer__form-info-checked').attr('disabled', true)

                                // Hiển thị tên người nhận tiền
                                $('#user-transfer__form-confirm-name').val(result.data.receiverName)

                                // Gán mã giao dịch vừa được tạo
                                transferTransactionId = result.data.transactionId
                            }

                            // Trường hợp gặp lỗi hệ thống
                            if (result.code === 2) {
                                isReloadTransferPage = true
                            }

                            transferModalBodyMessage.html(result.message)
                            transferModalMessage.modal('show')
                        }
                    })
                }, 1000)
            }
        }
    }, false)

    // Bắt sự kiện nhập số điện thoại người nhận
    userTransferInfoInputPhone.change(function () {
        const value = userTransferInfoInputPhone.val()

        if (!checkPhoneNumber(value)) {
            $('#user-transfer__form-info-phone-invalid').removeClass('d-none')
            userTransferInfoPhone = false
        } else {
            $('#user-transfer__form-info-phone-invalid').addClass('d-none')
            userTransferInfoPhone = true
        }
    })

    // Bắt sự kiện nhập số tiền
    userTransferInfoInputMoney.change(function () {
        const value = parseInt(userTransferInfoInputMoney.val())

        if (!value || value < 1000) {
            $('#user-transfer__form-info-money-invalid').removeClass('d-none')
            userTransferInfoMoney = false
        } else {
            $('#user-transfer__form-info-money-invalid').addClass('d-none')
            userTransferInfoMoney = true

            // Tính phí gửi 
            userTransferInfoFee.text(`${formatMoney(value * 0.05)}đ`)
        }
    })

    // Sự kiện modal message đóng
    transferModalMessage.on('hidden.bs.modal', function () {
        if (isReloadTransferPage) {
            window.location.reload()
        }
    })

    //** Xử lý Form Confirm */
    userTransferConfirmForm.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (userTransferConfirmForm.checkValidity() === false) {
            userTransferConfirmForm.classList.add('was-validated')
        } else {
            userTransferConfirmForm.classList.remove('was-validated')

            const otpCode = $('#user-transfer__form-confirm-otp').val()

            $.ajax({
                url: 'http://localhost:3000/transfer-confirm',
                method: 'POST',
                data: {
                    transactionId: transferTransactionId,
                    otpCode: otpCode
                },
                async: false,
                success: function (result) {
                    if (result.code !== 1) {
                        isReloadTransferPage = true
                    }

                    transferModalBodyMessage.html(result.message)
                    transferModalMessage.modal('show')
                }
            })

        }
    }, false)
}

// ***** Trang Card *****
if (document.querySelector('.user-card')) {
    const userCardForm = document.getElementById('user-card__form')
    const userCardSelectPrice = $('#user-card__form-price')
    const userCardSelectQuantity = $('#user-card__form-quantity')
    const userCardTotalPrice = $('#user-card__form-total')
    const userCardLoader = $('#user-card__form-loader')
    const userCardBtn = $('#user-card__form-btn')

    const cardModalMessage = $('#card-modal-message')
    const cardModalBodyMessage = $('#card-modal-body__message')

    updateUserCardTotalPrice()

    // Sự kiện gửi form lên
    userCardForm.addEventListener('submit', function (event) {
        event.preventDefault()
        event.stopPropagation()
        if (userCardForm.checkValidity() === false) {
            userCardForm.classList.add('was-validated')
        } else {
            userCardForm.classList.remove('was-validated')
            userCardLoader.removeClass('d-none')
            userCardLoader.addClass('d-flex')
            userCardBtn.addClass('d-none')

            updateUserCardTotalPrice()

            const nameCardPhone = $('input[name="user-card__network-options"]:checked').val()
            const typeCardPhone = parseInt(userCardSelectPrice.val())
            const numberCardPhone = parseInt(userCardSelectQuantity.val())

            const cardData = {
                name: nameCardPhone,
                type: typeCardPhone,
                number: numberCardPhone,
            }

            // Set timeout để tạo hiệu ứng loader trong khi thực hiện dữ liệu
            setTimeout(function () {
                $.ajax({
                    url: "http://localhost:3000/card",
                    type: "POST",
                    data: cardData,
                    async: false,
                    success: function (result) {
                        userCardLoader.addClass('d-none')
                        userCardLoader.removeClass('d-flex')
                        userCardBtn.removeClass('d-none')

                        if (result.code === 0) {
                            $('#user-card__result').removeClass('d-none')
                            $('#user-card__result-table-body tr').empty()

                            const { cardPhoneList, name, type } = result.data

                            cardPhoneList.forEach(cardPhone => {
                                $('#user-card__result-table-body').append(`
                                    <tr>
                                        <td>${cardPhone}</td>
                                        <td>${name}</td>
                                        <td>${formatMoney(type)}đ</td>
                                    </tr>
                                `)
                            })

                            userCardForm.reset()

                            updateUserCardTotalPrice()
                        }

                        cardModalBodyMessage.html(result.message)
                        cardModalMessage.modal('show')
                    }
                })
            }, 1000)
        }
    }, false)

    // Bắt sự kiện đổi mệnh giá thẻ
    userCardSelectPrice.change(function () {
        updateUserCardTotalPrice()
    })

    // Bắt sự kiện đổi số lượng thẻ mua
    userCardSelectQuantity.change(function () {
        updateUserCardTotalPrice()
    })

    // Cập nhật lại tổng tiền
    function updateUserCardTotalPrice() {
        const price = userCardSelectPrice.val()
        const quantity = userCardSelectQuantity.val()

        userCardTotalPrice.text(`${formatMoney(price * quantity)}đ`)
    }
}

// ***** Trang Change Password *****


// ------------------ Admin ------------------
// ***** Trang Users *****


// ***** Trang Detail User *****


// ***** Trang Transactions *****


// ***** Trang Detail Transaction *****


// ***** Các phương thức dùng chung *****
// Kiểm tra số điện thoại
function checkPhoneNumber(phone) {
    return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(phone)
}

// Format tiền
function formatMoney(a) {
    const formatter = new Intl.NumberFormat('vi-VN')

    return formatter.format(a)
}
