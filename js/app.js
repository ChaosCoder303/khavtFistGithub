AOS.init();

//scroll
let navbar = document.querySelector('.navbar');

window.onscroll = () => {

    navbar.classList.remove('active');
}

//chữ chạy ảo
let typed = new Typed('.auto-input', {
    strings: ['EDU Smart-Test'],
    typeSpeed: 50,
    backSpeed: 100,
    backDelay: 2000,
    loop: true
})

//angular

var API = 'http://localhost:3000';

var app = angular.module('asm', ['ngRoute']);

//chuyển trang

app.config(function ($routeProvider) {
    $routeProvider
        .when('/subjects', {
            templateUrl: 'views/subjects.html',
            controller: 'listCoureseCtrl',
        })
        .when('/test/:id/:name', {
            templateUrl: 'views/test.html',
            controller: 'quizsCtrl',
        })
        .when('/signIn', {
            templateUrl: 'views/signIn.html',
            controller: 'loginCtrl'
        })
        .when('/signUp', {
            templateUrl: 'views/signUp.html',
            controller: 'loginCtrl'
        })
        .when('/profile/:id', {
            templateUrl: 'views/profile.html',
            controller: 'updateCtrl'
        })
        .when('/changePass/:id', {
            templateUrl: 'views/changePass.html',
            controller: 'changePasswordController'
        })
        .when('/information/:email', {
            templateUrl: 'views/information.html',
            controller: 'informationCtrl'
        })
        .when('/introduce', {
            templateUrl: 'views/introduce.html'
        })
        .when('/forgotPass', {
            templateUrl: 'views/forgotPass.html',
            controller: 'forgotCtrl'
        })

})

//khóa học
app.controller('listCoureseCtrl', listCoureseCtrl);

function listCoureseCtrl($scope, $http) {
    // Simple GET request example:
    $http({
        method: 'GET',
        url: API + '/subjects'
    }).then(function successCallback(response) {
        //điều hướng
        $scope.subjects = response.data;

        $scope.begin = 0;
        $scope.pageCount = Math.ceil($scope.subjects.length / 8);

        $scope.first = function () {
            $scope.begin = 0;
        }

        $scope.previous = function () {
            if ($scope.begin > 0) {
                $scope.begin -= 8;
            }
        }

        $scope.next = function () {
            if ($scope.begin < ($scope.pageCount - 1) * 8) {
                $scope.begin += 8;
            }
        }

        $scope.last = function () {
            $scope.begin = ($scope.pageCount - 1) * 8;

        }

    }, function errorCallback(response) {
        console.log(response);
    });
}

//câu hỏi
app.controller('quizsCtrl', quizsCtrl);

function quizsCtrl($scope, $quizFactory, $http, $routeParams, $timeout) {
    $http.get('/db/Quizs/' + $routeParams.id + '.js')
        .then(function (response) {
            $quizFactory.ques = response.data;
        });

    $scope.start = function () {
        $quizFactory.getQuestions().then(function () {
            $scope.subjectName = $routeParams.name;
            $scope.id = 1;
            $scope.testQuiz = true;
            $scope.getQuestion();
            $scope.show = false;
            $scope.startQuiz = false;
        });
    };


    $scope.reset = function () {
        $scope.startQuiz = true;
        $scope.score = 0;
    }
    $scope.reset();


    $scope.getQuestion = function () {
        let quiz = $quizFactory.getQuestion($scope.id);
        if (quiz) {
            $scope.question = quiz.Text;
            $scope.options = quiz.Answers;
            $scope.answer = quiz.AnswerId;
        } else {
            $scope.show = true;
            $scope.testQuiz = false;
        }
    }

    $scope.checkAnswer = function () {
        if (!$('input[name=answer]:checked').length) {
            return;
        }
        var answer = $('input[name=answer]:checked').val();
        if (answer == $scope.answer) {
            $scope.id++;
            $scope.score++;
            $scope.getQuestion();
        } else {
            $scope.id++;
            $scope.getQuestion();
        }
    }




    //đồng hồ bấm giờ

    var count = 600;
    let timer;
    let isRunning = false;

    const display = document.getElementById("display");
    const startBtn = document.getElementById("start");

    const over = document.getElementById("over");

    function updateDisplay() {
        let minutes = Math.floor(count / 60);
        let seconds = count % 60;

        if (minutes < 10) {
            minutes = "" + minutes;
        }
        if (seconds < 10) {
            seconds = "" + seconds;
        }

        display.innerText = `${minutes} phút ${seconds} giây`;

        // if (minutes == 0 && seconds == 0) {
        //     stopTimer();
        //     display.innerText = 'Hết giờ';
        //     $scope.testQuiz = false;
        //     $scope.show = true;
        // }
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(() => {
                count--;
                updateDisplay();
            }, 1000);

            // Khi thời gian hết, hiển thị form kết quả
            $timeout(function () {
                stopTimer();
                display.innerText = "Hết Giờ";
                $scope.show = true;
                $scope.testQuiz = false;
            }, count * 1000);
        }

    }

    function stopTimer() {
        clearInterval(timer);
        isRunning = false;
    }


    function resetTimer() {
        stopTimer();
        count = 0;
        updateDisplay();
    }

    startBtn.addEventListener("click", startTimer);
}


app.factory('$quizFactory', function ($http, $routeParams) {
    return {
        getQuestions: function () {
            return $http.get('/db/Quizs/' + $routeParams.id + '.js')
                .then(function (response) {
                    ques = response.data;
                })
        },
        getQuestion: function (id) {
            var randomItem = ques[Math.floor(Math.random() * ques.length)];
            var count = ques.length;
            if (count > 10) {
                count = 10;
            }
            if (id < count) {
                return randomItem
            } else {
                return false;
            }
        }
    }
})

//đăng nhập , đăng ký

app.factory('userFactory', function ($http) {
    let userUrl = 'http://localhost:3000/student';

    return {
        signIn: function (user) {
            return $http.post(userUrl, user)
                .then(function (response) {
                    return response.data;
                });
        },

        signUp: function (user) {
            return $http.get(userUrl + '?email=' + user.email + '&password=' + user.password)
                .then(function (response) {
                    if (response.data.length > 0) {
                        localStorage.setItem('userInfor', JSON.stringify(response.data));
                    } else {
                        throw new Error('ko ton tai');
                    }
                })
        },

        checkEmailExits: function (email) {
            return $http.get(userUrl + '?email=' + email)
                .then(function (response) {
                    let users = response.data;
                    return users.length > 0;
                })
                .catch(function (error) {
                    console.log('Lỗi ' + error);
                })
        }
    };
})

//đăng ký

app.controller('loginCtrl', loginCtrl);

function loginCtrl($scope, userFactory, $http, $rootScope) {
    $scope.register = function () {
        var user = {
            fullname: $scope.fullname,
            password: $scope.password,
            email: $scope.email,
            numberphone: $scope.numberphone,
            username: $scope.username,
        }


        userFactory.checkEmailExits(user.email)
            .then(function (exits) {
                if (exits) {
                    alert('Email trùng');
                } else {
                    userFactory.signIn(user)
                        .then(function (data) {
                            alert('Đăng ký thành công');
                            console.log(data);
                            location = "#!signUp"
                            location.reload();
                        })
                        .catch(function (error) {
                            alert('Đăng ký thất bại');
                            console.log(error);
                        })
                }
            })
    }

    $scope.login = function () {
        var user = {
            email: $scope.email,
            password: $scope.password
        }

        userFactory.signUp(user)
            .then(function (data) {
                console.log(user);
                alert('Đăng nhập thành công');
                console.log(data);
                location = "#!"
                location.reload();
            })
            .catch(function (error) {
                alert('Đăng nhập thất bại');
                console.log(error);
            })
    }

    var userInfor = localStorage.getItem('userInfor');

    if (userInfor) {
        var user = JSON.parse(userInfor);
        $rootScope.emailInfor = user[0];
    } else {
        console.log('ko tim thay');
    }


    //đăng xuất
    $scope.logout = function () {
        localStorage.removeItem('userInfor')
        location = "#!"
        location.reload();
    }

}

//Cập nhật
app.controller('updateCtrl', updateCtrl);
function updateCtrl($scope, $http, $routeParams) {
    let id = $routeParams.id;

    $http({
        method: 'GET',
        url: API + '/student/' + id
    }).then(function successCallback(response) {
        $scope.profile = response.data
    }, function errorCallback(response) {
        console.log(response);
    });

    //Cập nhật thông tin
    $scope.updateUser = function () {
        $http({
            method: 'PUT',
            url: API + '/student/' + id,
            data: $scope.profile
        }).then(function successCallback(response) {
            $scope.profile = response.data;
            alert('Cập nhật thành công!')
        }, function errorCallback(response) {
            console.log(response);
            alert('Cập nhật không thành công!')
        });

    }

}

//Đổi mật khẩu
app.controller("changePasswordController", function ($scope, $http, $routeParams) {

    let userId = $routeParams.id
    $http({
        method: "GET",
        url: API + "/student/" + userId,
    }).then(
        function successCallback(response) {
            $scope.currentUser = response.data;
            console.log($scope.currentUser);
        },
        function errorCallback(response) {
            console.log(response);
        }
    );

    // Cập nhật mật khẩu
    $scope.changePassword = function () {

        if (userId.length < 0) {
            alert("Không tìm thấy thông tin người dùng.");
            return;
        }

        if ($scope.currentUser.password !== $scope.Password) {
            alert("Mật khẩu hiện tại không đúng");
            return;
        }

        // Kiểm tra mật khẩu mới và mật khẩu xác nhận
        if ($scope.newPassword !== $scope.confirmPassword) {
            alert("Mật khẩu mới và mật khẩu xác nhận không khớp.");
            return;
        }
        // Tạo đối tượng dữ liệu mới

        var updatedUser = {
            username: $scope.currentUser.username,
            email: $scope.currentUser.email,
            password: $scope.newPassword,
            fullname: $scope.currentUser.fullname,
            numberphone: $scope.currentUser.numberphone
        };

        // Gửi yêu cầu PUT đến server
        $http({
            method: "PUT",
            url: API + "/student/" + userId,
            data: updatedUser,
        }).then(
            function successCallback(response) {
                // Xử lý phản hồi từ server
                $scope.currentUser = response.data;
                alert('Đổi mật khẩu thành công!')
                localStorage.removeItem('userInfor')
                location = "#!signUp"
                location.reload();
            },
            function errorCallback(response) {
                console.log(response);
            }
        );
    };
});


app.controller('informationCtrl', informationCtrl);

function informationCtrl($scope, $http, $routeParams) {

    let email = $routeParams.email;
    console.log(email);

    $http({
        method: 'GET',
        url: API + '/student/'
    }).then(function successCallback(response) {
        $scope.information = response.data;
    }, function errorCallback(response) {
        console.log(response);
    });

    $scope.delete = function (id) {
        $http({
            method: 'DELETE',
            url: API + '/student/' + id
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
            console.log(response);
        });
    }

}

app.controller('forgotCtrl', forgotCtrl);

function forgotCtrl($scope, $http) {

    $scope.forgotPassword = function () {
        $http.get(API + '/student' + '?email=' + $scope.email)
            .then(function (response) {

                let users = response.data;
                alert('Mật khẩu là: ' + users[0].password)

            })
            .catch(function (error) {
                alert('Email khong ton tai');
            })
    }
}
