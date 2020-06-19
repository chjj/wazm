(module
  (type (;0;) (func (param i32) (result i32)))
  (type (;1;) (func (result i32)))
  (type (;2;) (func (param i32 i32 i32) (result i32)))
  (type (;3;) (func (param i32)))
  (type (;4;) (func (param i32 i32 i32)))
  (type (;5;) (func))
  (type (;6;) (func (param i32 i32 i32 i32 i32)))
  (type (;7;) (func (param i32 i32) (result i32)))
  (type (;8;) (func (param i32 i32 i32 i32 i32) (result i32)))
  (import "env" "emscripten_resize_heap" (func (;0;) (type 0)))
  (import "env" "emscripten_memcpy_big" (func (;1;) (type 2)))
  (import "env" "memory" (memory (;0;) 3 3))
  (func (;2;) (type 5)
    nop)
  (func (;3;) (type 1) (result i32)
    i32.const 400)
  (func (;4;) (type 0) (param i32) (result i32)
    i32.const 400
    call 11)
  (func (;5;) (type 7) (param i32 i32) (result i32)
    (local i32)
    block  ;; label = @1
      local.get 1
      i32.const -128
      i32.add
      i32.const 384
      i32.gt_u
      br_if 0 (;@1;)
      i32.const 1600
      local.get 1
      i32.const 1
      i32.shl
      i32.sub
      local.tee 1
      i32.const 62
      i32.and
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.const 400
      call 15
      local.get 1
      i32.const 3
      i32.shr_u
      i32.store offset=396
      i32.const 1
      local.set 2
    end
    local.get 2)
  (func (;6;) (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i32)
    block  ;; label = @1
      local.get 0
      i32.load offset=392
      local.tee 3
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 0
      local.get 2
      local.get 3
      i32.add
      local.get 0
      i32.load offset=396
      local.tee 4
      i32.rem_u
      i32.store offset=392
      local.get 3
      if  ;; label = @2
        local.get 0
        i32.const 200
        i32.add
        local.tee 5
        local.get 3
        i32.add
        local.get 1
        local.get 2
        local.get 4
        local.get 3
        i32.sub
        local.tee 3
        local.get 3
        local.get 2
        i32.gt_u
        local.tee 6
        select
        call 14
        drop
        local.get 6
        br_if 1 (;@1;)
        local.get 0
        local.get 5
        local.get 4
        call 7
        local.get 2
        local.get 3
        i32.sub
        local.set 2
        local.get 1
        local.get 3
        i32.add
        local.set 1
      end
      local.get 2
      local.get 4
      i32.ge_u
      if  ;; label = @2
        local.get 0
        i32.const 200
        i32.add
        local.set 3
        loop  ;; label = @3
          local.get 0
          local.get 3
          local.get 1
          local.get 4
          call 14
          local.get 4
          call 7
          local.get 1
          local.get 4
          i32.add
          local.set 1
          local.get 2
          local.get 4
          i32.sub
          local.tee 2
          local.get 4
          i32.ge_u
          br_if 0 (;@3;)
        end
      end
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const 200
      i32.add
      local.get 1
      local.get 2
      call 14
      drop
    end)
  (func (;7;) (type 4) (param i32 i32 i32)
    (local i32 i32 i32 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64 i64)
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 2
                i32.const -72
                i32.add
                i32.const 29
                i32.rotl
                br_table 3 (;@3;) 4 (;@2;) 4 (;@2;) 4 (;@2;) 2 (;@4;) 4 (;@2;) 4 (;@2;) 4 (;@2;) 1 (;@5;) 0 (;@6;) 4 (;@2;)
              end
              local.get 0
              local.get 0
              i64.load offset=136
              local.get 1
              i64.load offset=136
              i64.xor
              i64.store offset=136
            end
            local.get 0
            local.get 0
            i64.load offset=128
            local.get 1
            i64.load offset=128
            i64.xor
            i64.store offset=128
            local.get 0
            local.get 0
            i64.load offset=120
            local.get 1
            i64.load offset=120
            i64.xor
            i64.store offset=120
            local.get 0
            local.get 0
            i64.load offset=112
            local.get 1
            i64.load offset=112
            i64.xor
            i64.store offset=112
            local.get 0
            local.get 0
            i64.load offset=104
            local.get 1
            i64.load offset=104
            i64.xor
            i64.store offset=104
          end
          local.get 0
          local.get 0
          i64.load offset=96
          local.get 1
          i64.load offset=96
          i64.xor
          i64.store offset=96
          local.get 0
          local.get 0
          i64.load offset=88
          local.get 1
          i64.load offset=88
          i64.xor
          i64.store offset=88
          local.get 0
          local.get 0
          i64.load offset=80
          local.get 1
          i64.load offset=80
          i64.xor
          i64.store offset=80
          local.get 0
          local.get 0
          i64.load offset=72
          local.get 1
          i64.load offset=72
          i64.xor
          i64.store offset=72
        end
        local.get 0
        local.get 0
        i64.load offset=64
        local.get 1
        i64.load offset=64
        i64.xor
        i64.store offset=64
        local.get 0
        local.get 0
        i64.load offset=56
        local.get 1
        i64.load offset=56
        i64.xor
        i64.store offset=56
        local.get 0
        local.get 0
        i64.load offset=48
        local.get 1
        i64.load offset=48
        i64.xor
        i64.store offset=48
        local.get 0
        local.get 0
        i64.load offset=40
        local.get 1
        i64.load offset=40
        i64.xor
        i64.store offset=40
        local.get 0
        local.get 0
        i64.load offset=32
        local.get 1
        i64.load offset=32
        i64.xor
        i64.store offset=32
        local.get 0
        local.get 0
        i64.load offset=24
        local.get 1
        i64.load offset=24
        i64.xor
        i64.store offset=24
        local.get 0
        local.get 0
        i64.load offset=16
        local.get 1
        i64.load offset=16
        i64.xor
        i64.store offset=16
        local.get 0
        local.get 0
        i64.load offset=8
        local.get 1
        i64.load offset=8
        i64.xor
        i64.store offset=8
        local.get 0
        local.get 0
        i64.load
        local.get 1
        i64.load
        i64.xor
        i64.store
        br 1 (;@1;)
      end
      local.get 2
      i32.const 3
      i32.shr_u
      local.tee 3
      i32.eqz
      br_if 0 (;@1;)
      i32.const 0
      local.set 2
      loop  ;; label = @2
        local.get 0
        local.get 2
        i32.const 3
        i32.shl
        local.tee 4
        i32.add
        local.tee 5
        local.get 5
        i64.load
        local.get 1
        local.get 4
        i32.add
        i64.load
        i64.xor
        i64.store
        local.get 2
        i32.const 1
        i32.add
        local.tee 2
        local.get 3
        i32.ne
        br_if 0 (;@2;)
      end
    end
    local.get 0
    i64.load offset=192
    local.set 12
    local.get 0
    i64.load offset=152
    local.set 33
    local.get 0
    i64.load offset=112
    local.set 15
    local.get 0
    i64.load offset=72
    local.set 16
    local.get 0
    i64.load offset=32
    local.set 34
    local.get 0
    i64.load offset=184
    local.set 35
    local.get 0
    i64.load offset=144
    local.set 36
    local.get 0
    i64.load offset=104
    local.set 13
    local.get 0
    i64.load offset=64
    local.set 17
    local.get 0
    i64.load offset=24
    local.set 11
    local.get 0
    i64.load offset=176
    local.set 37
    local.get 0
    i64.load offset=136
    local.set 18
    local.get 0
    i64.load offset=96
    local.set 19
    local.get 0
    i64.load offset=56
    local.set 20
    local.get 0
    i64.load offset=16
    local.set 21
    local.get 0
    i64.load offset=168
    local.set 22
    local.get 0
    i64.load offset=128
    local.set 38
    local.get 0
    i64.load offset=88
    local.set 23
    local.get 0
    i64.load offset=48
    local.set 24
    local.get 0
    i64.load offset=8
    local.set 25
    local.get 0
    i64.load offset=160
    local.set 14
    local.get 0
    i64.load offset=120
    local.set 26
    local.get 0
    i64.load offset=80
    local.set 39
    local.get 0
    i64.load offset=40
    local.set 27
    local.get 0
    i64.load
    local.set 28
    i32.const 0
    local.set 1
    loop  ;; label = @1
      local.get 35
      local.get 36
      i64.xor
      local.get 13
      i64.xor
      local.get 17
      i64.xor
      local.get 11
      i64.xor
      local.tee 8
      local.get 14
      local.get 26
      i64.xor
      local.get 39
      i64.xor
      local.get 27
      i64.xor
      local.get 28
      i64.xor
      local.tee 9
      i64.const 1
      i64.rotl
      i64.xor
      local.tee 6
      local.get 12
      i64.xor
      local.set 52
      local.get 12
      local.get 33
      i64.xor
      local.get 15
      i64.xor
      local.get 16
      i64.xor
      local.get 34
      i64.xor
      local.tee 12
      local.get 22
      local.get 38
      i64.xor
      local.get 23
      i64.xor
      local.get 24
      i64.xor
      local.get 25
      i64.xor
      local.tee 10
      i64.const 1
      i64.rotl
      i64.xor
      local.tee 7
      local.get 28
      i64.xor
      local.tee 29
      local.get 1
      i32.const 3
      i32.shl
      i32.const 1024
      i32.add
      i64.load
      i64.xor
      local.get 10
      local.get 8
      i64.const 1
      i64.rotl
      i64.xor
      local.tee 8
      local.get 19
      i64.xor
      i64.const 43
      i64.rotl
      local.tee 30
      local.get 9
      local.get 18
      local.get 37
      i64.xor
      local.get 19
      i64.xor
      local.get 20
      i64.xor
      local.get 21
      i64.xor
      local.tee 10
      i64.const 1
      i64.rotl
      i64.xor
      local.tee 9
      local.get 24
      i64.xor
      i64.const 44
      i64.rotl
      local.tee 31
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 28
      local.get 9
      local.get 22
      i64.xor
      i64.const 2
      i64.rotl
      local.tee 32
      local.get 10
      local.get 12
      i64.const 1
      i64.rotl
      i64.xor
      local.tee 10
      local.get 17
      i64.xor
      i64.const 55
      i64.rotl
      local.tee 40
      local.get 8
      local.get 21
      i64.xor
      i64.const 62
      i64.rotl
      local.tee 41
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 12
      local.get 7
      local.get 26
      i64.xor
      i64.const 41
      i64.rotl
      local.tee 42
      local.get 6
      local.get 15
      i64.xor
      i64.const 39
      i64.rotl
      local.tee 43
      i64.const -1
      i64.xor
      i64.and
      local.get 40
      i64.xor
      local.set 22
      local.get 9
      local.get 23
      i64.xor
      i64.const 10
      i64.rotl
      local.tee 44
      local.get 10
      local.get 35
      i64.xor
      i64.const 56
      i64.rotl
      local.tee 45
      local.get 8
      local.get 18
      i64.xor
      i64.const 15
      i64.rotl
      local.tee 46
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 18
      local.get 6
      local.get 34
      i64.xor
      i64.const 27
      i64.rotl
      local.tee 47
      local.get 44
      local.get 7
      local.get 27
      i64.xor
      i64.const 36
      i64.rotl
      local.tee 48
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 26
      local.get 7
      local.get 14
      i64.xor
      i64.const 18
      i64.rotl
      local.tee 14
      local.get 8
      local.get 20
      i64.xor
      i64.const 6
      i64.rotl
      local.tee 49
      local.get 9
      local.get 25
      i64.xor
      i64.const 1
      i64.rotl
      local.tee 50
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 15
      local.get 10
      local.get 13
      i64.xor
      i64.const 25
      i64.rotl
      local.tee 51
      local.get 14
      local.get 6
      local.get 33
      i64.xor
      i64.const 8
      i64.rotl
      local.tee 13
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 19
      local.get 13
      local.get 51
      i64.const -1
      i64.xor
      i64.and
      local.get 49
      i64.xor
      local.set 23
      local.get 8
      local.get 37
      i64.xor
      i64.const 61
      i64.rotl
      local.tee 8
      local.get 6
      local.get 16
      i64.xor
      i64.const 20
      i64.rotl
      local.tee 6
      local.get 10
      local.get 11
      i64.xor
      i64.const 28
      i64.rotl
      local.tee 11
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 16
      local.get 9
      local.get 38
      i64.xor
      i64.const 45
      i64.rotl
      local.tee 9
      local.get 11
      local.get 8
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 17
      local.get 7
      local.get 39
      i64.xor
      i64.const 3
      i64.rotl
      local.tee 7
      local.get 8
      local.get 9
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 20
      local.get 6
      local.get 9
      local.get 7
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 24
      local.get 7
      local.get 6
      i64.const -1
      i64.xor
      i64.and
      local.get 11
      i64.xor
      local.set 27
      local.get 10
      local.get 36
      i64.xor
      i64.const 21
      i64.rotl
      local.tee 7
      local.get 29
      local.get 52
      i64.const 14
      i64.rotl
      local.tee 6
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 11
      local.get 6
      local.get 7
      i64.const -1
      i64.xor
      i64.and
      local.get 30
      i64.xor
      local.set 21
      local.get 31
      local.get 7
      local.get 30
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.set 25
      local.get 48
      local.get 47
      i64.const -1
      i64.xor
      i64.and
      local.get 45
      i64.xor
      local.tee 7
      local.set 33
      local.get 6
      local.get 31
      local.get 29
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.tee 6
      local.set 34
      local.get 41
      local.get 32
      i64.const -1
      i64.xor
      i64.and
      local.get 42
      i64.xor
      local.tee 8
      local.set 35
      local.get 47
      local.get 45
      i64.const -1
      i64.xor
      i64.and
      local.get 46
      i64.xor
      local.tee 9
      local.set 36
      local.get 13
      local.get 50
      local.get 14
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.tee 10
      local.set 13
      local.get 43
      local.get 32
      local.get 42
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.tee 29
      local.set 37
      local.get 46
      local.get 44
      i64.const -1
      i64.xor
      i64.and
      local.get 48
      i64.xor
      local.tee 30
      local.set 38
      local.get 43
      local.get 40
      i64.const -1
      i64.xor
      i64.and
      local.get 41
      i64.xor
      local.tee 31
      local.set 14
      local.get 50
      local.get 51
      local.get 49
      i64.const -1
      i64.xor
      i64.and
      i64.xor
      local.tee 32
      local.set 39
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      i32.const 24
      i32.ne
      br_if 0 (;@1;)
    end
    local.get 0
    local.get 31
    i64.store offset=160
    local.get 0
    local.get 26
    i64.store offset=120
    local.get 0
    local.get 32
    i64.store offset=80
    local.get 0
    local.get 27
    i64.store offset=40
    local.get 0
    local.get 28
    i64.store
    local.get 0
    local.get 22
    i64.store offset=168
    local.get 0
    local.get 30
    i64.store offset=128
    local.get 0
    local.get 23
    i64.store offset=88
    local.get 0
    local.get 24
    i64.store offset=48
    local.get 0
    local.get 25
    i64.store offset=8
    local.get 0
    local.get 29
    i64.store offset=176
    local.get 0
    local.get 18
    i64.store offset=136
    local.get 0
    local.get 19
    i64.store offset=96
    local.get 0
    local.get 20
    i64.store offset=56
    local.get 0
    local.get 21
    i64.store offset=16
    local.get 0
    local.get 8
    i64.store offset=184
    local.get 0
    local.get 9
    i64.store offset=144
    local.get 0
    local.get 10
    i64.store offset=104
    local.get 0
    local.get 17
    i64.store offset=64
    local.get 0
    local.get 11
    i64.store offset=24
    local.get 0
    local.get 12
    i64.store offset=192
    local.get 0
    local.get 7
    i64.store offset=152
    local.get 0
    local.get 15
    i64.store offset=112
    local.get 0
    local.get 16
    i64.store offset=72
    local.get 0
    local.get 6
    i64.store offset=32)
  (func (;8;) (type 8) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32)
    block  ;; label = @1
      local.get 3
      i32.const 100
      local.get 0
      i32.load offset=396
      local.tee 6
      i32.const 1
      i32.shr_u
      i32.sub
      local.get 3
      select
      local.tee 3
      i32.const 200
      i32.gt_u
      br_if 0 (;@1;)
      local.get 3
      local.get 6
      i32.ge_u
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=392
      local.tee 7
      i32.const 0
      i32.ge_s
      if  ;; label = @2
        local.get 0
        i32.const 200
        i32.add
        local.tee 5
        local.get 7
        i32.add
        i32.const 0
        local.get 6
        local.get 7
        i32.sub
        call 15
        drop
        local.get 5
        local.get 0
        i32.load offset=392
        i32.add
        local.tee 7
        local.get 7
        i32.load8_u
        local.get 4
        i32.or
        i32.store8
        local.get 5
        local.get 6
        i32.add
        i32.const -1
        i32.add
        local.tee 4
        local.get 4
        i32.load8_u
        i32.const 128
        i32.or
        i32.store8
        local.get 0
        local.get 5
        local.get 6
        call 7
        local.get 0
        i32.const -2147483648
        i32.store offset=392
      end
      local.get 1
      if  ;; label = @2
        local.get 1
        local.get 0
        local.get 3
        call 14
        drop
      end
      i32.const 1
      local.set 5
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      local.get 3
      i32.store
    end
    local.get 5)
  (func (;9;) (type 6) (param i32 i32 i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 400
    i32.sub
    local.tee 5
    global.set 0
    local.get 5
    i32.const 0
    i32.const 392
    call 15
    local.tee 5
    i32.const 136
    i32.store offset=396
    local.get 5
    local.get 2
    i32.const 136
    i32.rem_u
    i32.store offset=392
    local.get 2
    i32.const 136
    i32.ge_u
    if  ;; label = @1
      local.get 5
      i32.const 200
      i32.add
      local.set 6
      loop  ;; label = @2
        local.get 5
        local.get 6
        local.get 1
        i32.const 136
        call 14
        i32.const 136
        call 7
        local.get 1
        i32.const 136
        i32.add
        local.set 1
        local.get 2
        i32.const -136
        i32.add
        local.tee 2
        i32.const 135
        i32.gt_u
        br_if 0 (;@2;)
      end
    end
    local.get 2
    if  ;; label = @1
      local.get 5
      i32.const 200
      i32.add
      local.get 1
      local.get 2
      call 14
      drop
    end
    block  ;; label = @1
      local.get 3
      i32.const 100
      local.get 5
      i32.load offset=396
      local.tee 1
      i32.const 1
      i32.shr_u
      i32.sub
      local.get 3
      select
      local.tee 2
      i32.const 200
      i32.gt_u
      br_if 0 (;@1;)
      local.get 2
      local.get 1
      i32.ge_u
      br_if 0 (;@1;)
      local.get 5
      i32.load offset=392
      local.tee 3
      i32.const 0
      i32.ge_s
      if  ;; label = @2
        local.get 5
        i32.const 200
        i32.add
        local.tee 6
        local.get 3
        i32.add
        i32.const 0
        local.get 1
        local.get 3
        i32.sub
        call 15
        drop
        local.get 6
        local.get 5
        i32.load offset=392
        i32.add
        local.tee 3
        local.get 3
        i32.load8_u
        local.get 4
        i32.or
        i32.store8
        local.get 1
        local.get 6
        i32.add
        i32.const -1
        i32.add
        local.tee 3
        local.get 3
        i32.load8_u
        i32.const 128
        i32.or
        i32.store8
        local.get 5
        local.get 6
        local.get 1
        call 7
        local.get 5
        i32.const -2147483648
        i32.store offset=392
      end
      local.get 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      local.get 5
      local.get 2
      call 14
      drop
    end
    local.get 5
    i32.const 400
    i32.add
    global.set 0)
  (func (;10;) (type 1) (result i32)
    i32.const 1216)
  (func (;11;) (type 0) (param i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 11
    global.set 0
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          local.get 0
                          i32.const 244
                          i32.le_u
                          if  ;; label = @12
                            i32.const 1220
                            i32.load
                            local.tee 6
                            i32.const 16
                            local.get 0
                            i32.const 11
                            i32.add
                            i32.const -8
                            i32.and
                            local.get 0
                            i32.const 11
                            i32.lt_u
                            select
                            local.tee 4
                            i32.const 3
                            i32.shr_u
                            local.tee 1
                            i32.shr_u
                            local.tee 0
                            i32.const 3
                            i32.and
                            if  ;; label = @13
                              local.get 0
                              i32.const -1
                              i32.xor
                              i32.const 1
                              i32.and
                              local.get 1
                              i32.add
                              local.tee 4
                              i32.const 3
                              i32.shl
                              local.tee 2
                              i32.const 1268
                              i32.add
                              i32.load
                              local.tee 1
                              i32.const 8
                              i32.add
                              local.set 0
                              block  ;; label = @14
                                local.get 1
                                i32.load offset=8
                                local.tee 3
                                local.get 2
                                i32.const 1260
                                i32.add
                                local.tee 2
                                i32.eq
                                if  ;; label = @15
                                  i32.const 1220
                                  local.get 6
                                  i32.const -2
                                  local.get 4
                                  i32.rotl
                                  i32.and
                                  i32.store
                                  br 1 (;@14;)
                                end
                                i32.const 1236
                                i32.load
                                drop
                                local.get 3
                                local.get 2
                                i32.store offset=12
                                local.get 2
                                local.get 3
                                i32.store offset=8
                              end
                              local.get 1
                              local.get 4
                              i32.const 3
                              i32.shl
                              local.tee 3
                              i32.const 3
                              i32.or
                              i32.store offset=4
                              local.get 1
                              local.get 3
                              i32.add
                              local.tee 1
                              local.get 1
                              i32.load offset=4
                              i32.const 1
                              i32.or
                              i32.store offset=4
                              br 12 (;@1;)
                            end
                            local.get 4
                            i32.const 1228
                            i32.load
                            local.tee 8
                            i32.le_u
                            br_if 1 (;@11;)
                            local.get 0
                            if  ;; label = @13
                              block  ;; label = @14
                                local.get 0
                                local.get 1
                                i32.shl
                                i32.const 2
                                local.get 1
                                i32.shl
                                local.tee 0
                                i32.const 0
                                local.get 0
                                i32.sub
                                i32.or
                                i32.and
                                local.tee 0
                                i32.const 0
                                local.get 0
                                i32.sub
                                i32.and
                                i32.const -1
                                i32.add
                                local.tee 0
                                local.get 0
                                i32.const 12
                                i32.shr_u
                                i32.const 16
                                i32.and
                                local.tee 0
                                i32.shr_u
                                local.tee 1
                                i32.const 5
                                i32.shr_u
                                i32.const 8
                                i32.and
                                local.tee 3
                                local.get 0
                                i32.or
                                local.get 1
                                local.get 3
                                i32.shr_u
                                local.tee 0
                                i32.const 2
                                i32.shr_u
                                i32.const 4
                                i32.and
                                local.tee 1
                                i32.or
                                local.get 0
                                local.get 1
                                i32.shr_u
                                local.tee 0
                                i32.const 1
                                i32.shr_u
                                i32.const 2
                                i32.and
                                local.tee 1
                                i32.or
                                local.get 0
                                local.get 1
                                i32.shr_u
                                local.tee 0
                                i32.const 1
                                i32.shr_u
                                i32.const 1
                                i32.and
                                local.tee 1
                                i32.or
                                local.get 0
                                local.get 1
                                i32.shr_u
                                i32.add
                                local.tee 3
                                i32.const 3
                                i32.shl
                                local.tee 2
                                i32.const 1268
                                i32.add
                                i32.load
                                local.tee 1
                                i32.load offset=8
                                local.tee 0
                                local.get 2
                                i32.const 1260
                                i32.add
                                local.tee 2
                                i32.eq
                                if  ;; label = @15
                                  i32.const 1220
                                  local.get 6
                                  i32.const -2
                                  local.get 3
                                  i32.rotl
                                  i32.and
                                  local.tee 6
                                  i32.store
                                  br 1 (;@14;)
                                end
                                i32.const 1236
                                i32.load
                                drop
                                local.get 0
                                local.get 2
                                i32.store offset=12
                                local.get 2
                                local.get 0
                                i32.store offset=8
                              end
                              local.get 1
                              i32.const 8
                              i32.add
                              local.set 0
                              local.get 1
                              local.get 4
                              i32.const 3
                              i32.or
                              i32.store offset=4
                              local.get 1
                              local.get 4
                              i32.add
                              local.tee 2
                              local.get 3
                              i32.const 3
                              i32.shl
                              local.tee 5
                              local.get 4
                              i32.sub
                              local.tee 3
                              i32.const 1
                              i32.or
                              i32.store offset=4
                              local.get 1
                              local.get 5
                              i32.add
                              local.get 3
                              i32.store
                              local.get 8
                              if  ;; label = @14
                                local.get 8
                                i32.const 3
                                i32.shr_u
                                local.tee 5
                                i32.const 3
                                i32.shl
                                i32.const 1260
                                i32.add
                                local.set 4
                                i32.const 1240
                                i32.load
                                local.set 1
                                block (result i32)  ;; label = @15
                                  local.get 6
                                  i32.const 1
                                  local.get 5
                                  i32.shl
                                  local.tee 5
                                  i32.and
                                  i32.eqz
                                  if  ;; label = @16
                                    i32.const 1220
                                    local.get 5
                                    local.get 6
                                    i32.or
                                    i32.store
                                    local.get 4
                                    br 1 (;@15;)
                                  end
                                  local.get 4
                                  i32.load offset=8
                                end
                                local.set 5
                                local.get 4
                                local.get 1
                                i32.store offset=8
                                local.get 5
                                local.get 1
                                i32.store offset=12
                                local.get 1
                                local.get 4
                                i32.store offset=12
                                local.get 1
                                local.get 5
                                i32.store offset=8
                              end
                              i32.const 1240
                              local.get 2
                              i32.store
                              i32.const 1228
                              local.get 3
                              i32.store
                              br 12 (;@1;)
                            end
                            i32.const 1224
                            i32.load
                            local.tee 9
                            i32.eqz
                            br_if 1 (;@11;)
                            local.get 9
                            i32.const 0
                            local.get 9
                            i32.sub
                            i32.and
                            i32.const -1
                            i32.add
                            local.tee 0
                            local.get 0
                            i32.const 12
                            i32.shr_u
                            i32.const 16
                            i32.and
                            local.tee 0
                            i32.shr_u
                            local.tee 1
                            i32.const 5
                            i32.shr_u
                            i32.const 8
                            i32.and
                            local.tee 3
                            local.get 0
                            i32.or
                            local.get 1
                            local.get 3
                            i32.shr_u
                            local.tee 0
                            i32.const 2
                            i32.shr_u
                            i32.const 4
                            i32.and
                            local.tee 1
                            i32.or
                            local.get 0
                            local.get 1
                            i32.shr_u
                            local.tee 0
                            i32.const 1
                            i32.shr_u
                            i32.const 2
                            i32.and
                            local.tee 1
                            i32.or
                            local.get 0
                            local.get 1
                            i32.shr_u
                            local.tee 0
                            i32.const 1
                            i32.shr_u
                            i32.const 1
                            i32.and
                            local.tee 1
                            i32.or
                            local.get 0
                            local.get 1
                            i32.shr_u
                            i32.add
                            i32.const 2
                            i32.shl
                            i32.const 1524
                            i32.add
                            i32.load
                            local.tee 2
                            i32.load offset=4
                            i32.const -8
                            i32.and
                            local.get 4
                            i32.sub
                            local.set 1
                            local.get 2
                            local.set 3
                            loop  ;; label = @13
                              block  ;; label = @14
                                local.get 3
                                i32.load offset=16
                                local.tee 0
                                i32.eqz
                                if  ;; label = @15
                                  local.get 3
                                  i32.load offset=20
                                  local.tee 0
                                  i32.eqz
                                  br_if 1 (;@14;)
                                end
                                local.get 0
                                i32.load offset=4
                                i32.const -8
                                i32.and
                                local.get 4
                                i32.sub
                                local.tee 3
                                local.get 1
                                local.get 3
                                local.get 1
                                i32.lt_u
                                local.tee 3
                                select
                                local.set 1
                                local.get 0
                                local.get 2
                                local.get 3
                                select
                                local.set 2
                                local.get 0
                                local.set 3
                                br 1 (;@13;)
                              end
                            end
                            local.get 2
                            i32.load offset=24
                            local.set 10
                            local.get 2
                            local.get 2
                            i32.load offset=12
                            local.tee 5
                            i32.ne
                            if  ;; label = @13
                              i32.const 1236
                              i32.load
                              local.get 2
                              i32.load offset=8
                              local.tee 0
                              i32.le_u
                              if  ;; label = @14
                                local.get 0
                                i32.load offset=12
                                drop
                              end
                              local.get 0
                              local.get 5
                              i32.store offset=12
                              local.get 5
                              local.get 0
                              i32.store offset=8
                              br 11 (;@2;)
                            end
                            local.get 2
                            i32.const 20
                            i32.add
                            local.tee 3
                            i32.load
                            local.tee 0
                            i32.eqz
                            if  ;; label = @13
                              local.get 2
                              i32.load offset=16
                              local.tee 0
                              i32.eqz
                              br_if 3 (;@10;)
                              local.get 2
                              i32.const 16
                              i32.add
                              local.set 3
                            end
                            loop  ;; label = @13
                              local.get 3
                              local.set 7
                              local.get 0
                              local.tee 5
                              i32.const 20
                              i32.add
                              local.tee 3
                              i32.load
                              local.tee 0
                              br_if 0 (;@13;)
                              local.get 5
                              i32.const 16
                              i32.add
                              local.set 3
                              local.get 5
                              i32.load offset=16
                              local.tee 0
                              br_if 0 (;@13;)
                            end
                            local.get 7
                            i32.const 0
                            i32.store
                            br 10 (;@2;)
                          end
                          i32.const -1
                          local.set 4
                          local.get 0
                          i32.const -65
                          i32.gt_u
                          br_if 0 (;@11;)
                          local.get 0
                          i32.const 11
                          i32.add
                          local.tee 0
                          i32.const -8
                          i32.and
                          local.set 4
                          i32.const 1224
                          i32.load
                          local.tee 8
                          i32.eqz
                          br_if 0 (;@11;)
                          block (result i32)  ;; label = @12
                            i32.const 0
                            local.get 0
                            i32.const 8
                            i32.shr_u
                            local.tee 0
                            i32.eqz
                            br_if 0 (;@12;)
                            drop
                            i32.const 31
                            local.get 4
                            i32.const 16777215
                            i32.gt_u
                            br_if 0 (;@12;)
                            drop
                            local.get 0
                            local.get 0
                            i32.const 1048320
                            i32.add
                            i32.const 16
                            i32.shr_u
                            i32.const 8
                            i32.and
                            local.tee 1
                            i32.shl
                            local.tee 0
                            local.get 0
                            i32.const 520192
                            i32.add
                            i32.const 16
                            i32.shr_u
                            i32.const 4
                            i32.and
                            local.tee 0
                            i32.shl
                            local.tee 3
                            local.get 3
                            i32.const 245760
                            i32.add
                            i32.const 16
                            i32.shr_u
                            i32.const 2
                            i32.and
                            local.tee 3
                            i32.shl
                            i32.const 15
                            i32.shr_u
                            local.get 0
                            local.get 1
                            i32.or
                            local.get 3
                            i32.or
                            i32.sub
                            local.tee 0
                            i32.const 1
                            i32.shl
                            local.get 4
                            local.get 0
                            i32.const 21
                            i32.add
                            i32.shr_u
                            i32.const 1
                            i32.and
                            i32.or
                            i32.const 28
                            i32.add
                          end
                          local.set 7
                          i32.const 0
                          local.get 4
                          i32.sub
                          local.set 3
                          block  ;; label = @12
                            block  ;; label = @13
                              block  ;; label = @14
                                local.get 7
                                i32.const 2
                                i32.shl
                                i32.const 1524
                                i32.add
                                i32.load
                                local.tee 1
                                i32.eqz
                                if  ;; label = @15
                                  i32.const 0
                                  local.set 0
                                  br 1 (;@14;)
                                end
                                local.get 4
                                i32.const 0
                                i32.const 25
                                local.get 7
                                i32.const 1
                                i32.shr_u
                                i32.sub
                                local.get 7
                                i32.const 31
                                i32.eq
                                select
                                i32.shl
                                local.set 2
                                i32.const 0
                                local.set 0
                                loop  ;; label = @15
                                  block  ;; label = @16
                                    local.get 1
                                    i32.load offset=4
                                    i32.const -8
                                    i32.and
                                    local.get 4
                                    i32.sub
                                    local.tee 6
                                    local.get 3
                                    i32.ge_u
                                    br_if 0 (;@16;)
                                    local.get 1
                                    local.set 5
                                    local.get 6
                                    local.tee 3
                                    br_if 0 (;@16;)
                                    i32.const 0
                                    local.set 3
                                    local.get 1
                                    local.set 0
                                    br 3 (;@13;)
                                  end
                                  local.get 0
                                  local.get 1
                                  i32.load offset=20
                                  local.tee 6
                                  local.get 6
                                  local.get 1
                                  local.get 2
                                  i32.const 29
                                  i32.shr_u
                                  i32.const 4
                                  i32.and
                                  i32.add
                                  i32.load offset=16
                                  local.tee 1
                                  i32.eq
                                  select
                                  local.get 0
                                  local.get 6
                                  select
                                  local.set 0
                                  local.get 2
                                  local.get 1
                                  i32.const 0
                                  i32.ne
                                  i32.shl
                                  local.set 2
                                  local.get 1
                                  br_if 0 (;@15;)
                                end
                              end
                              local.get 0
                              local.get 5
                              i32.or
                              i32.eqz
                              if  ;; label = @14
                                i32.const 2
                                local.get 7
                                i32.shl
                                local.tee 0
                                i32.const 0
                                local.get 0
                                i32.sub
                                i32.or
                                local.get 8
                                i32.and
                                local.tee 0
                                i32.eqz
                                br_if 3 (;@11;)
                                local.get 0
                                i32.const 0
                                local.get 0
                                i32.sub
                                i32.and
                                i32.const -1
                                i32.add
                                local.tee 0
                                local.get 0
                                i32.const 12
                                i32.shr_u
                                i32.const 16
                                i32.and
                                local.tee 0
                                i32.shr_u
                                local.tee 1
                                i32.const 5
                                i32.shr_u
                                i32.const 8
                                i32.and
                                local.tee 2
                                local.get 0
                                i32.or
                                local.get 1
                                local.get 2
                                i32.shr_u
                                local.tee 0
                                i32.const 2
                                i32.shr_u
                                i32.const 4
                                i32.and
                                local.tee 1
                                i32.or
                                local.get 0
                                local.get 1
                                i32.shr_u
                                local.tee 0
                                i32.const 1
                                i32.shr_u
                                i32.const 2
                                i32.and
                                local.tee 1
                                i32.or
                                local.get 0
                                local.get 1
                                i32.shr_u
                                local.tee 0
                                i32.const 1
                                i32.shr_u
                                i32.const 1
                                i32.and
                                local.tee 1
                                i32.or
                                local.get 0
                                local.get 1
                                i32.shr_u
                                i32.add
                                i32.const 2
                                i32.shl
                                i32.const 1524
                                i32.add
                                i32.load
                                local.set 0
                              end
                              local.get 0
                              i32.eqz
                              br_if 1 (;@12;)
                            end
                            loop  ;; label = @13
                              local.get 0
                              i32.load offset=4
                              i32.const -8
                              i32.and
                              local.get 4
                              i32.sub
                              local.tee 6
                              local.get 3
                              i32.lt_u
                              local.set 2
                              local.get 6
                              local.get 3
                              local.get 2
                              select
                              local.set 3
                              local.get 0
                              local.get 5
                              local.get 2
                              select
                              local.set 5
                              local.get 0
                              i32.load offset=16
                              local.tee 1
                              if (result i32)  ;; label = @14
                                local.get 1
                              else
                                local.get 0
                                i32.load offset=20
                              end
                              local.tee 0
                              br_if 0 (;@13;)
                            end
                          end
                          local.get 5
                          i32.eqz
                          br_if 0 (;@11;)
                          local.get 3
                          i32.const 1228
                          i32.load
                          local.get 4
                          i32.sub
                          i32.ge_u
                          br_if 0 (;@11;)
                          local.get 5
                          i32.load offset=24
                          local.set 7
                          local.get 5
                          local.get 5
                          i32.load offset=12
                          local.tee 2
                          i32.ne
                          if  ;; label = @12
                            i32.const 1236
                            i32.load
                            local.get 5
                            i32.load offset=8
                            local.tee 0
                            i32.le_u
                            if  ;; label = @13
                              local.get 0
                              i32.load offset=12
                              drop
                            end
                            local.get 0
                            local.get 2
                            i32.store offset=12
                            local.get 2
                            local.get 0
                            i32.store offset=8
                            br 9 (;@3;)
                          end
                          local.get 5
                          i32.const 20
                          i32.add
                          local.tee 1
                          i32.load
                          local.tee 0
                          i32.eqz
                          if  ;; label = @12
                            local.get 5
                            i32.load offset=16
                            local.tee 0
                            i32.eqz
                            br_if 3 (;@9;)
                            local.get 5
                            i32.const 16
                            i32.add
                            local.set 1
                          end
                          loop  ;; label = @12
                            local.get 1
                            local.set 6
                            local.get 0
                            local.tee 2
                            i32.const 20
                            i32.add
                            local.tee 1
                            i32.load
                            local.tee 0
                            br_if 0 (;@12;)
                            local.get 2
                            i32.const 16
                            i32.add
                            local.set 1
                            local.get 2
                            i32.load offset=16
                            local.tee 0
                            br_if 0 (;@12;)
                          end
                          local.get 6
                          i32.const 0
                          i32.store
                          br 8 (;@3;)
                        end
                        i32.const 1228
                        i32.load
                        local.tee 0
                        local.get 4
                        i32.ge_u
                        if  ;; label = @11
                          i32.const 1240
                          i32.load
                          local.set 1
                          block  ;; label = @12
                            local.get 0
                            local.get 4
                            i32.sub
                            local.tee 3
                            i32.const 16
                            i32.ge_u
                            if  ;; label = @13
                              i32.const 1228
                              local.get 3
                              i32.store
                              i32.const 1240
                              local.get 1
                              local.get 4
                              i32.add
                              local.tee 2
                              i32.store
                              local.get 2
                              local.get 3
                              i32.const 1
                              i32.or
                              i32.store offset=4
                              local.get 0
                              local.get 1
                              i32.add
                              local.get 3
                              i32.store
                              local.get 1
                              local.get 4
                              i32.const 3
                              i32.or
                              i32.store offset=4
                              br 1 (;@12;)
                            end
                            i32.const 1240
                            i32.const 0
                            i32.store
                            i32.const 1228
                            i32.const 0
                            i32.store
                            local.get 1
                            local.get 0
                            i32.const 3
                            i32.or
                            i32.store offset=4
                            local.get 0
                            local.get 1
                            i32.add
                            local.tee 0
                            local.get 0
                            i32.load offset=4
                            i32.const 1
                            i32.or
                            i32.store offset=4
                          end
                          local.get 1
                          i32.const 8
                          i32.add
                          local.set 0
                          br 10 (;@1;)
                        end
                        i32.const 1232
                        i32.load
                        local.tee 2
                        local.get 4
                        i32.gt_u
                        if  ;; label = @11
                          i32.const 1232
                          local.get 2
                          local.get 4
                          i32.sub
                          local.tee 1
                          i32.store
                          i32.const 1244
                          i32.const 1244
                          i32.load
                          local.tee 0
                          local.get 4
                          i32.add
                          local.tee 3
                          i32.store
                          local.get 3
                          local.get 1
                          i32.const 1
                          i32.or
                          i32.store offset=4
                          local.get 0
                          local.get 4
                          i32.const 3
                          i32.or
                          i32.store offset=4
                          local.get 0
                          i32.const 8
                          i32.add
                          local.set 0
                          br 10 (;@1;)
                        end
                        i32.const 0
                        local.set 0
                        local.get 4
                        i32.const 47
                        i32.add
                        local.tee 8
                        block (result i32)  ;; label = @11
                          i32.const 1692
                          i32.load
                          if  ;; label = @12
                            i32.const 1700
                            i32.load
                            br 1 (;@11;)
                          end
                          i32.const 1704
                          i64.const -1
                          i64.store align=4
                          i32.const 1696
                          i64.const 17592186048512
                          i64.store align=4
                          i32.const 1692
                          local.get 11
                          i32.const 12
                          i32.add
                          i32.const -16
                          i32.and
                          i32.const 1431655768
                          i32.xor
                          i32.store
                          i32.const 1712
                          i32.const 0
                          i32.store
                          i32.const 1664
                          i32.const 0
                          i32.store
                          i32.const 4096
                        end
                        local.tee 1
                        i32.add
                        local.tee 6
                        i32.const 0
                        local.get 1
                        i32.sub
                        local.tee 7
                        i32.and
                        local.tee 5
                        local.get 4
                        i32.le_u
                        br_if 9 (;@1;)
                        i32.const 1660
                        i32.load
                        local.tee 1
                        if  ;; label = @11
                          i32.const 1652
                          i32.load
                          local.tee 3
                          local.get 5
                          i32.add
                          local.tee 9
                          local.get 3
                          i32.le_u
                          br_if 10 (;@1;)
                          local.get 9
                          local.get 1
                          i32.gt_u
                          br_if 10 (;@1;)
                        end
                        i32.const 1664
                        i32.load8_u
                        i32.const 4
                        i32.and
                        br_if 4 (;@6;)
                        block  ;; label = @11
                          block  ;; label = @12
                            i32.const 1244
                            i32.load
                            local.tee 1
                            if  ;; label = @13
                              i32.const 1668
                              local.set 0
                              loop  ;; label = @14
                                local.get 0
                                i32.load
                                local.tee 3
                                local.get 1
                                i32.le_u
                                if  ;; label = @15
                                  local.get 3
                                  local.get 0
                                  i32.load offset=4
                                  i32.add
                                  local.get 1
                                  i32.gt_u
                                  br_if 3 (;@12;)
                                end
                                local.get 0
                                i32.load offset=8
                                local.tee 0
                                br_if 0 (;@14;)
                              end
                            end
                            i32.const 0
                            call 13
                            local.tee 2
                            i32.const -1
                            i32.eq
                            br_if 5 (;@7;)
                            local.get 5
                            local.set 6
                            i32.const 1696
                            i32.load
                            local.tee 0
                            i32.const -1
                            i32.add
                            local.tee 1
                            local.get 2
                            i32.and
                            if  ;; label = @13
                              local.get 5
                              local.get 2
                              i32.sub
                              local.get 1
                              local.get 2
                              i32.add
                              i32.const 0
                              local.get 0
                              i32.sub
                              i32.and
                              i32.add
                              local.set 6
                            end
                            local.get 6
                            local.get 4
                            i32.le_u
                            br_if 5 (;@7;)
                            local.get 6
                            i32.const 2147483646
                            i32.gt_u
                            br_if 5 (;@7;)
                            i32.const 1660
                            i32.load
                            local.tee 0
                            if  ;; label = @13
                              i32.const 1652
                              i32.load
                              local.tee 1
                              local.get 6
                              i32.add
                              local.tee 3
                              local.get 1
                              i32.le_u
                              br_if 6 (;@7;)
                              local.get 3
                              local.get 0
                              i32.gt_u
                              br_if 6 (;@7;)
                            end
                            local.get 6
                            call 13
                            local.tee 0
                            local.get 2
                            i32.ne
                            br_if 1 (;@11;)
                            br 7 (;@5;)
                          end
                          local.get 6
                          local.get 2
                          i32.sub
                          local.get 7
                          i32.and
                          local.tee 6
                          i32.const 2147483646
                          i32.gt_u
                          br_if 4 (;@7;)
                          local.get 6
                          call 13
                          local.tee 2
                          local.get 0
                          i32.load
                          local.get 0
                          i32.load offset=4
                          i32.add
                          i32.eq
                          br_if 3 (;@8;)
                          local.get 2
                          local.set 0
                        end
                        block  ;; label = @11
                          local.get 4
                          i32.const 48
                          i32.add
                          local.get 6
                          i32.le_u
                          br_if 0 (;@11;)
                          local.get 0
                          i32.const -1
                          i32.eq
                          br_if 0 (;@11;)
                          i32.const 1700
                          i32.load
                          local.tee 1
                          local.get 8
                          local.get 6
                          i32.sub
                          i32.add
                          i32.const 0
                          local.get 1
                          i32.sub
                          i32.and
                          local.tee 1
                          i32.const 2147483646
                          i32.gt_u
                          if  ;; label = @12
                            local.get 0
                            local.set 2
                            br 7 (;@5;)
                          end
                          local.get 1
                          call 13
                          i32.const -1
                          i32.ne
                          if  ;; label = @12
                            local.get 1
                            local.get 6
                            i32.add
                            local.set 6
                            local.get 0
                            local.set 2
                            br 7 (;@5;)
                          end
                          i32.const 0
                          local.get 6
                          i32.sub
                          call 13
                          drop
                          br 4 (;@7;)
                        end
                        local.get 0
                        local.set 2
                        local.get 0
                        i32.const -1
                        i32.ne
                        br_if 5 (;@5;)
                        br 3 (;@7;)
                      end
                      i32.const 0
                      local.set 5
                      br 7 (;@2;)
                    end
                    i32.const 0
                    local.set 2
                    br 5 (;@3;)
                  end
                  local.get 2
                  i32.const -1
                  i32.ne
                  br_if 2 (;@5;)
                end
                i32.const 1664
                i32.const 1664
                i32.load
                i32.const 4
                i32.or
                i32.store
              end
              local.get 5
              i32.const 2147483646
              i32.gt_u
              br_if 1 (;@4;)
              local.get 5
              call 13
              local.tee 2
              i32.const 0
              call 13
              local.tee 0
              i32.ge_u
              br_if 1 (;@4;)
              local.get 2
              i32.const -1
              i32.eq
              br_if 1 (;@4;)
              local.get 0
              i32.const -1
              i32.eq
              br_if 1 (;@4;)
              local.get 0
              local.get 2
              i32.sub
              local.tee 6
              local.get 4
              i32.const 40
              i32.add
              i32.le_u
              br_if 1 (;@4;)
            end
            i32.const 1652
            i32.const 1652
            i32.load
            local.get 6
            i32.add
            local.tee 0
            i32.store
            local.get 0
            i32.const 1656
            i32.load
            i32.gt_u
            if  ;; label = @5
              i32.const 1656
              local.get 0
              i32.store
            end
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  i32.const 1244
                  i32.load
                  local.tee 1
                  if  ;; label = @8
                    i32.const 1668
                    local.set 0
                    loop  ;; label = @9
                      local.get 2
                      local.get 0
                      i32.load
                      local.tee 3
                      local.get 0
                      i32.load offset=4
                      local.tee 5
                      i32.add
                      i32.eq
                      br_if 2 (;@7;)
                      local.get 0
                      i32.load offset=8
                      local.tee 0
                      br_if 0 (;@9;)
                    end
                    br 2 (;@6;)
                  end
                  i32.const 1236
                  i32.load
                  local.tee 0
                  i32.const 0
                  local.get 2
                  local.get 0
                  i32.ge_u
                  select
                  i32.eqz
                  if  ;; label = @8
                    i32.const 1236
                    local.get 2
                    i32.store
                  end
                  i32.const 0
                  local.set 0
                  i32.const 1672
                  local.get 6
                  i32.store
                  i32.const 1668
                  local.get 2
                  i32.store
                  i32.const 1252
                  i32.const -1
                  i32.store
                  i32.const 1256
                  i32.const 1692
                  i32.load
                  i32.store
                  i32.const 1680
                  i32.const 0
                  i32.store
                  loop  ;; label = @8
                    local.get 0
                    i32.const 3
                    i32.shl
                    local.tee 1
                    i32.const 1268
                    i32.add
                    local.get 1
                    i32.const 1260
                    i32.add
                    local.tee 3
                    i32.store
                    local.get 1
                    i32.const 1272
                    i32.add
                    local.get 3
                    i32.store
                    local.get 0
                    i32.const 1
                    i32.add
                    local.tee 0
                    i32.const 32
                    i32.ne
                    br_if 0 (;@8;)
                  end
                  i32.const 1232
                  local.get 6
                  i32.const -40
                  i32.add
                  local.tee 0
                  i32.const -8
                  local.get 2
                  i32.sub
                  i32.const 7
                  i32.and
                  i32.const 0
                  local.get 2
                  i32.const 8
                  i32.add
                  i32.const 7
                  i32.and
                  select
                  local.tee 1
                  i32.sub
                  local.tee 3
                  i32.store
                  i32.const 1244
                  local.get 1
                  local.get 2
                  i32.add
                  local.tee 1
                  i32.store
                  local.get 1
                  local.get 3
                  i32.const 1
                  i32.or
                  i32.store offset=4
                  local.get 0
                  local.get 2
                  i32.add
                  i32.const 40
                  i32.store offset=4
                  i32.const 1248
                  i32.const 1708
                  i32.load
                  i32.store
                  br 2 (;@5;)
                end
                local.get 0
                i32.load8_u offset=12
                i32.const 8
                i32.and
                br_if 0 (;@6;)
                local.get 2
                local.get 1
                i32.le_u
                br_if 0 (;@6;)
                local.get 3
                local.get 1
                i32.gt_u
                br_if 0 (;@6;)
                local.get 0
                local.get 5
                local.get 6
                i32.add
                i32.store offset=4
                i32.const 1244
                local.get 1
                i32.const -8
                local.get 1
                i32.sub
                i32.const 7
                i32.and
                i32.const 0
                local.get 1
                i32.const 8
                i32.add
                i32.const 7
                i32.and
                select
                local.tee 0
                i32.add
                local.tee 3
                i32.store
                i32.const 1232
                i32.const 1232
                i32.load
                local.get 6
                i32.add
                local.tee 2
                local.get 0
                i32.sub
                local.tee 0
                i32.store
                local.get 3
                local.get 0
                i32.const 1
                i32.or
                i32.store offset=4
                local.get 1
                local.get 2
                i32.add
                i32.const 40
                i32.store offset=4
                i32.const 1248
                i32.const 1708
                i32.load
                i32.store
                br 1 (;@5;)
              end
              local.get 2
              i32.const 1236
              i32.load
              local.tee 5
              i32.lt_u
              if  ;; label = @6
                i32.const 1236
                local.get 2
                i32.store
                local.get 2
                local.set 5
              end
              local.get 2
              local.get 6
              i32.add
              local.set 3
              i32.const 1668
              local.set 0
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          loop  ;; label = @12
                            local.get 3
                            local.get 0
                            i32.load
                            i32.ne
                            if  ;; label = @13
                              local.get 0
                              i32.load offset=8
                              local.tee 0
                              br_if 1 (;@12;)
                              br 2 (;@11;)
                            end
                          end
                          local.get 0
                          i32.load8_u offset=12
                          i32.const 8
                          i32.and
                          i32.eqz
                          br_if 1 (;@10;)
                        end
                        i32.const 1668
                        local.set 0
                        loop  ;; label = @11
                          local.get 0
                          i32.load
                          local.tee 3
                          local.get 1
                          i32.le_u
                          if  ;; label = @12
                            local.get 3
                            local.get 0
                            i32.load offset=4
                            i32.add
                            local.tee 3
                            local.get 1
                            i32.gt_u
                            br_if 3 (;@9;)
                          end
                          local.get 0
                          i32.load offset=8
                          local.set 0
                          br 0 (;@11;)
                          unreachable
                        end
                        unreachable
                      end
                      local.get 0
                      local.get 2
                      i32.store
                      local.get 0
                      local.get 0
                      i32.load offset=4
                      local.get 6
                      i32.add
                      i32.store offset=4
                      local.get 2
                      i32.const -8
                      local.get 2
                      i32.sub
                      i32.const 7
                      i32.and
                      i32.const 0
                      local.get 2
                      i32.const 8
                      i32.add
                      i32.const 7
                      i32.and
                      select
                      i32.add
                      local.tee 7
                      local.get 4
                      i32.const 3
                      i32.or
                      i32.store offset=4
                      local.get 3
                      i32.const -8
                      local.get 3
                      i32.sub
                      i32.const 7
                      i32.and
                      i32.const 0
                      local.get 3
                      i32.const 8
                      i32.add
                      i32.const 7
                      i32.and
                      select
                      i32.add
                      local.tee 2
                      local.get 7
                      i32.sub
                      local.get 4
                      i32.sub
                      local.set 0
                      local.get 4
                      local.get 7
                      i32.add
                      local.set 3
                      local.get 1
                      local.get 2
                      i32.eq
                      if  ;; label = @10
                        i32.const 1244
                        local.get 3
                        i32.store
                        i32.const 1232
                        i32.const 1232
                        i32.load
                        local.get 0
                        i32.add
                        local.tee 0
                        i32.store
                        local.get 3
                        local.get 0
                        i32.const 1
                        i32.or
                        i32.store offset=4
                        br 3 (;@7;)
                      end
                      local.get 2
                      i32.const 1240
                      i32.load
                      i32.eq
                      if  ;; label = @10
                        i32.const 1240
                        local.get 3
                        i32.store
                        i32.const 1228
                        i32.const 1228
                        i32.load
                        local.get 0
                        i32.add
                        local.tee 0
                        i32.store
                        local.get 3
                        local.get 0
                        i32.const 1
                        i32.or
                        i32.store offset=4
                        local.get 0
                        local.get 3
                        i32.add
                        local.get 0
                        i32.store
                        br 3 (;@7;)
                      end
                      local.get 2
                      i32.load offset=4
                      local.tee 1
                      i32.const 3
                      i32.and
                      i32.const 1
                      i32.eq
                      if  ;; label = @10
                        local.get 1
                        i32.const -8
                        i32.and
                        local.set 8
                        block  ;; label = @11
                          local.get 1
                          i32.const 255
                          i32.le_u
                          if  ;; label = @12
                            local.get 2
                            i32.load offset=8
                            local.tee 6
                            local.get 1
                            i32.const 3
                            i32.shr_u
                            local.tee 9
                            i32.const 3
                            i32.shl
                            i32.const 1260
                            i32.add
                            i32.ne
                            drop
                            local.get 2
                            i32.load offset=12
                            local.tee 4
                            local.get 6
                            i32.eq
                            if  ;; label = @13
                              i32.const 1220
                              i32.const 1220
                              i32.load
                              i32.const -2
                              local.get 9
                              i32.rotl
                              i32.and
                              i32.store
                              br 2 (;@11;)
                            end
                            local.get 6
                            local.get 4
                            i32.store offset=12
                            local.get 4
                            local.get 6
                            i32.store offset=8
                            br 1 (;@11;)
                          end
                          local.get 2
                          i32.load offset=24
                          local.set 9
                          block  ;; label = @12
                            local.get 2
                            local.get 2
                            i32.load offset=12
                            local.tee 6
                            i32.ne
                            if  ;; label = @13
                              local.get 5
                              local.get 2
                              i32.load offset=8
                              local.tee 1
                              i32.le_u
                              if  ;; label = @14
                                local.get 1
                                i32.load offset=12
                                drop
                              end
                              local.get 1
                              local.get 6
                              i32.store offset=12
                              local.get 6
                              local.get 1
                              i32.store offset=8
                              br 1 (;@12;)
                            end
                            block  ;; label = @13
                              local.get 2
                              i32.const 20
                              i32.add
                              local.tee 1
                              i32.load
                              local.tee 4
                              br_if 0 (;@13;)
                              local.get 2
                              i32.const 16
                              i32.add
                              local.tee 1
                              i32.load
                              local.tee 4
                              br_if 0 (;@13;)
                              i32.const 0
                              local.set 6
                              br 1 (;@12;)
                            end
                            loop  ;; label = @13
                              local.get 1
                              local.set 5
                              local.get 4
                              local.tee 6
                              i32.const 20
                              i32.add
                              local.tee 1
                              i32.load
                              local.tee 4
                              br_if 0 (;@13;)
                              local.get 6
                              i32.const 16
                              i32.add
                              local.set 1
                              local.get 6
                              i32.load offset=16
                              local.tee 4
                              br_if 0 (;@13;)
                            end
                            local.get 5
                            i32.const 0
                            i32.store
                          end
                          local.get 9
                          i32.eqz
                          br_if 0 (;@11;)
                          block  ;; label = @12
                            local.get 2
                            local.get 2
                            i32.load offset=28
                            local.tee 4
                            i32.const 2
                            i32.shl
                            i32.const 1524
                            i32.add
                            local.tee 1
                            i32.load
                            i32.eq
                            if  ;; label = @13
                              local.get 1
                              local.get 6
                              i32.store
                              local.get 6
                              br_if 1 (;@12;)
                              i32.const 1224
                              i32.const 1224
                              i32.load
                              i32.const -2
                              local.get 4
                              i32.rotl
                              i32.and
                              i32.store
                              br 2 (;@11;)
                            end
                            local.get 9
                            i32.const 16
                            i32.const 20
                            local.get 9
                            i32.load offset=16
                            local.get 2
                            i32.eq
                            select
                            i32.add
                            local.get 6
                            i32.store
                            local.get 6
                            i32.eqz
                            br_if 1 (;@11;)
                          end
                          local.get 6
                          local.get 9
                          i32.store offset=24
                          local.get 2
                          i32.load offset=16
                          local.tee 1
                          if  ;; label = @12
                            local.get 6
                            local.get 1
                            i32.store offset=16
                            local.get 1
                            local.get 6
                            i32.store offset=24
                          end
                          local.get 2
                          i32.load offset=20
                          local.tee 1
                          i32.eqz
                          br_if 0 (;@11;)
                          local.get 6
                          local.get 1
                          i32.store offset=20
                          local.get 1
                          local.get 6
                          i32.store offset=24
                        end
                        local.get 2
                        local.get 8
                        i32.add
                        local.set 2
                        local.get 0
                        local.get 8
                        i32.add
                        local.set 0
                      end
                      local.get 2
                      local.get 2
                      i32.load offset=4
                      i32.const -2
                      i32.and
                      i32.store offset=4
                      local.get 3
                      local.get 0
                      i32.const 1
                      i32.or
                      i32.store offset=4
                      local.get 0
                      local.get 3
                      i32.add
                      local.get 0
                      i32.store
                      local.get 0
                      i32.const 255
                      i32.le_u
                      if  ;; label = @10
                        local.get 0
                        i32.const 3
                        i32.shr_u
                        local.tee 1
                        i32.const 3
                        i32.shl
                        i32.const 1260
                        i32.add
                        local.set 0
                        block (result i32)  ;; label = @11
                          i32.const 1220
                          i32.load
                          local.tee 4
                          i32.const 1
                          local.get 1
                          i32.shl
                          local.tee 1
                          i32.and
                          i32.eqz
                          if  ;; label = @12
                            i32.const 1220
                            local.get 1
                            local.get 4
                            i32.or
                            i32.store
                            local.get 0
                            br 1 (;@11;)
                          end
                          local.get 0
                          i32.load offset=8
                        end
                        local.set 1
                        local.get 0
                        local.get 3
                        i32.store offset=8
                        local.get 1
                        local.get 3
                        i32.store offset=12
                        local.get 3
                        local.get 0
                        i32.store offset=12
                        local.get 3
                        local.get 1
                        i32.store offset=8
                        br 3 (;@7;)
                      end
                      local.get 3
                      block (result i32)  ;; label = @10
                        i32.const 0
                        local.get 0
                        i32.const 8
                        i32.shr_u
                        local.tee 4
                        i32.eqz
                        br_if 0 (;@10;)
                        drop
                        i32.const 31
                        local.get 0
                        i32.const 16777215
                        i32.gt_u
                        br_if 0 (;@10;)
                        drop
                        local.get 4
                        local.get 4
                        i32.const 1048320
                        i32.add
                        i32.const 16
                        i32.shr_u
                        i32.const 8
                        i32.and
                        local.tee 1
                        i32.shl
                        local.tee 4
                        local.get 4
                        i32.const 520192
                        i32.add
                        i32.const 16
                        i32.shr_u
                        i32.const 4
                        i32.and
                        local.tee 4
                        i32.shl
                        local.tee 2
                        local.get 2
                        i32.const 245760
                        i32.add
                        i32.const 16
                        i32.shr_u
                        i32.const 2
                        i32.and
                        local.tee 2
                        i32.shl
                        i32.const 15
                        i32.shr_u
                        local.get 1
                        local.get 4
                        i32.or
                        local.get 2
                        i32.or
                        i32.sub
                        local.tee 1
                        i32.const 1
                        i32.shl
                        local.get 0
                        local.get 1
                        i32.const 21
                        i32.add
                        i32.shr_u
                        i32.const 1
                        i32.and
                        i32.or
                        i32.const 28
                        i32.add
                      end
                      local.tee 1
                      i32.store offset=28
                      local.get 3
                      i64.const 0
                      i64.store offset=16 align=4
                      local.get 1
                      i32.const 2
                      i32.shl
                      i32.const 1524
                      i32.add
                      local.set 4
                      block  ;; label = @10
                        i32.const 1224
                        i32.load
                        local.tee 2
                        i32.const 1
                        local.get 1
                        i32.shl
                        local.tee 5
                        i32.and
                        i32.eqz
                        if  ;; label = @11
                          i32.const 1224
                          local.get 2
                          local.get 5
                          i32.or
                          i32.store
                          local.get 4
                          local.get 3
                          i32.store
                          local.get 3
                          local.get 4
                          i32.store offset=24
                          br 1 (;@10;)
                        end
                        local.get 0
                        i32.const 0
                        i32.const 25
                        local.get 1
                        i32.const 1
                        i32.shr_u
                        i32.sub
                        local.get 1
                        i32.const 31
                        i32.eq
                        select
                        i32.shl
                        local.set 1
                        local.get 4
                        i32.load
                        local.set 2
                        loop  ;; label = @11
                          local.get 2
                          local.tee 4
                          i32.load offset=4
                          i32.const -8
                          i32.and
                          local.get 0
                          i32.eq
                          br_if 3 (;@8;)
                          local.get 1
                          i32.const 29
                          i32.shr_u
                          local.set 2
                          local.get 1
                          i32.const 1
                          i32.shl
                          local.set 1
                          local.get 4
                          local.get 2
                          i32.const 4
                          i32.and
                          i32.add
                          i32.const 16
                          i32.add
                          local.tee 5
                          i32.load
                          local.tee 2
                          br_if 0 (;@11;)
                        end
                        local.get 5
                        local.get 3
                        i32.store
                        local.get 3
                        local.get 4
                        i32.store offset=24
                      end
                      local.get 3
                      local.get 3
                      i32.store offset=12
                      local.get 3
                      local.get 3
                      i32.store offset=8
                      br 2 (;@7;)
                    end
                    i32.const 1232
                    local.get 6
                    i32.const -40
                    i32.add
                    local.tee 0
                    i32.const -8
                    local.get 2
                    i32.sub
                    i32.const 7
                    i32.and
                    i32.const 0
                    local.get 2
                    i32.const 8
                    i32.add
                    i32.const 7
                    i32.and
                    select
                    local.tee 5
                    i32.sub
                    local.tee 7
                    i32.store
                    i32.const 1244
                    local.get 2
                    local.get 5
                    i32.add
                    local.tee 5
                    i32.store
                    local.get 5
                    local.get 7
                    i32.const 1
                    i32.or
                    i32.store offset=4
                    local.get 0
                    local.get 2
                    i32.add
                    i32.const 40
                    i32.store offset=4
                    i32.const 1248
                    i32.const 1708
                    i32.load
                    i32.store
                    local.get 1
                    local.get 3
                    i32.const 39
                    local.get 3
                    i32.sub
                    i32.const 7
                    i32.and
                    i32.const 0
                    local.get 3
                    i32.const -39
                    i32.add
                    i32.const 7
                    i32.and
                    select
                    i32.add
                    i32.const -47
                    i32.add
                    local.tee 0
                    local.get 0
                    local.get 1
                    i32.const 16
                    i32.add
                    i32.lt_u
                    select
                    local.tee 5
                    i32.const 27
                    i32.store offset=4
                    local.get 5
                    i32.const 1676
                    i64.load align=4
                    i64.store offset=16 align=4
                    local.get 5
                    i32.const 1668
                    i64.load align=4
                    i64.store offset=8 align=4
                    i32.const 1676
                    local.get 5
                    i32.const 8
                    i32.add
                    i32.store
                    i32.const 1672
                    local.get 6
                    i32.store
                    i32.const 1668
                    local.get 2
                    i32.store
                    i32.const 1680
                    i32.const 0
                    i32.store
                    local.get 5
                    i32.const 24
                    i32.add
                    local.set 0
                    loop  ;; label = @9
                      local.get 0
                      i32.const 7
                      i32.store offset=4
                      local.get 0
                      i32.const 8
                      i32.add
                      local.set 2
                      local.get 0
                      i32.const 4
                      i32.add
                      local.set 0
                      local.get 3
                      local.get 2
                      i32.gt_u
                      br_if 0 (;@9;)
                    end
                    local.get 1
                    local.get 5
                    i32.eq
                    br_if 3 (;@5;)
                    local.get 5
                    local.get 5
                    i32.load offset=4
                    i32.const -2
                    i32.and
                    i32.store offset=4
                    local.get 1
                    local.get 5
                    local.get 1
                    i32.sub
                    local.tee 6
                    i32.const 1
                    i32.or
                    i32.store offset=4
                    local.get 5
                    local.get 6
                    i32.store
                    local.get 6
                    i32.const 255
                    i32.le_u
                    if  ;; label = @9
                      local.get 6
                      i32.const 3
                      i32.shr_u
                      local.tee 3
                      i32.const 3
                      i32.shl
                      i32.const 1260
                      i32.add
                      local.set 0
                      block (result i32)  ;; label = @10
                        i32.const 1220
                        i32.load
                        local.tee 2
                        i32.const 1
                        local.get 3
                        i32.shl
                        local.tee 3
                        i32.and
                        i32.eqz
                        if  ;; label = @11
                          i32.const 1220
                          local.get 2
                          local.get 3
                          i32.or
                          i32.store
                          local.get 0
                          br 1 (;@10;)
                        end
                        local.get 0
                        i32.load offset=8
                      end
                      local.set 3
                      local.get 0
                      local.get 1
                      i32.store offset=8
                      local.get 3
                      local.get 1
                      i32.store offset=12
                      local.get 1
                      local.get 0
                      i32.store offset=12
                      local.get 1
                      local.get 3
                      i32.store offset=8
                      br 4 (;@5;)
                    end
                    local.get 1
                    i64.const 0
                    i64.store offset=16 align=4
                    local.get 1
                    block (result i32)  ;; label = @9
                      i32.const 0
                      local.get 6
                      i32.const 8
                      i32.shr_u
                      local.tee 3
                      i32.eqz
                      br_if 0 (;@9;)
                      drop
                      i32.const 31
                      local.get 6
                      i32.const 16777215
                      i32.gt_u
                      br_if 0 (;@9;)
                      drop
                      local.get 3
                      local.get 3
                      i32.const 1048320
                      i32.add
                      i32.const 16
                      i32.shr_u
                      i32.const 8
                      i32.and
                      local.tee 0
                      i32.shl
                      local.tee 3
                      local.get 3
                      i32.const 520192
                      i32.add
                      i32.const 16
                      i32.shr_u
                      i32.const 4
                      i32.and
                      local.tee 3
                      i32.shl
                      local.tee 2
                      local.get 2
                      i32.const 245760
                      i32.add
                      i32.const 16
                      i32.shr_u
                      i32.const 2
                      i32.and
                      local.tee 2
                      i32.shl
                      i32.const 15
                      i32.shr_u
                      local.get 0
                      local.get 3
                      i32.or
                      local.get 2
                      i32.or
                      i32.sub
                      local.tee 0
                      i32.const 1
                      i32.shl
                      local.get 6
                      local.get 0
                      i32.const 21
                      i32.add
                      i32.shr_u
                      i32.const 1
                      i32.and
                      i32.or
                      i32.const 28
                      i32.add
                    end
                    local.tee 0
                    i32.store offset=28
                    local.get 0
                    i32.const 2
                    i32.shl
                    i32.const 1524
                    i32.add
                    local.set 3
                    block  ;; label = @9
                      i32.const 1224
                      i32.load
                      local.tee 2
                      i32.const 1
                      local.get 0
                      i32.shl
                      local.tee 5
                      i32.and
                      i32.eqz
                      if  ;; label = @10
                        i32.const 1224
                        local.get 2
                        local.get 5
                        i32.or
                        i32.store
                        local.get 3
                        local.get 1
                        i32.store
                        local.get 1
                        local.get 3
                        i32.store offset=24
                        br 1 (;@9;)
                      end
                      local.get 6
                      i32.const 0
                      i32.const 25
                      local.get 0
                      i32.const 1
                      i32.shr_u
                      i32.sub
                      local.get 0
                      i32.const 31
                      i32.eq
                      select
                      i32.shl
                      local.set 0
                      local.get 3
                      i32.load
                      local.set 2
                      loop  ;; label = @10
                        local.get 2
                        local.tee 3
                        i32.load offset=4
                        i32.const -8
                        i32.and
                        local.get 6
                        i32.eq
                        br_if 4 (;@6;)
                        local.get 0
                        i32.const 29
                        i32.shr_u
                        local.set 2
                        local.get 0
                        i32.const 1
                        i32.shl
                        local.set 0
                        local.get 3
                        local.get 2
                        i32.const 4
                        i32.and
                        i32.add
                        i32.const 16
                        i32.add
                        local.tee 5
                        i32.load
                        local.tee 2
                        br_if 0 (;@10;)
                      end
                      local.get 5
                      local.get 1
                      i32.store
                      local.get 1
                      local.get 3
                      i32.store offset=24
                    end
                    local.get 1
                    local.get 1
                    i32.store offset=12
                    local.get 1
                    local.get 1
                    i32.store offset=8
                    br 3 (;@5;)
                  end
                  local.get 4
                  i32.load offset=8
                  local.tee 0
                  local.get 3
                  i32.store offset=12
                  local.get 4
                  local.get 3
                  i32.store offset=8
                  local.get 3
                  i32.const 0
                  i32.store offset=24
                  local.get 3
                  local.get 4
                  i32.store offset=12
                  local.get 3
                  local.get 0
                  i32.store offset=8
                end
                local.get 7
                i32.const 8
                i32.add
                local.set 0
                br 5 (;@1;)
              end
              local.get 3
              i32.load offset=8
              local.tee 0
              local.get 1
              i32.store offset=12
              local.get 3
              local.get 1
              i32.store offset=8
              local.get 1
              i32.const 0
              i32.store offset=24
              local.get 1
              local.get 3
              i32.store offset=12
              local.get 1
              local.get 0
              i32.store offset=8
            end
            i32.const 1232
            i32.load
            local.tee 0
            local.get 4
            i32.le_u
            br_if 0 (;@4;)
            i32.const 1232
            local.get 0
            local.get 4
            i32.sub
            local.tee 1
            i32.store
            i32.const 1244
            i32.const 1244
            i32.load
            local.tee 0
            local.get 4
            i32.add
            local.tee 3
            i32.store
            local.get 3
            local.get 1
            i32.const 1
            i32.or
            i32.store offset=4
            local.get 0
            local.get 4
            i32.const 3
            i32.or
            i32.store offset=4
            local.get 0
            i32.const 8
            i32.add
            local.set 0
            br 3 (;@1;)
          end
          i32.const 1216
          i32.const 48
          i32.store
          i32.const 0
          local.set 0
          br 2 (;@1;)
        end
        block  ;; label = @3
          local.get 7
          i32.eqz
          br_if 0 (;@3;)
          block  ;; label = @4
            local.get 5
            i32.load offset=28
            local.tee 1
            i32.const 2
            i32.shl
            i32.const 1524
            i32.add
            local.tee 0
            i32.load
            local.get 5
            i32.eq
            if  ;; label = @5
              local.get 0
              local.get 2
              i32.store
              local.get 2
              br_if 1 (;@4;)
              i32.const 1224
              local.get 8
              i32.const -2
              local.get 1
              i32.rotl
              i32.and
              local.tee 8
              i32.store
              br 2 (;@3;)
            end
            local.get 7
            i32.const 16
            i32.const 20
            local.get 7
            i32.load offset=16
            local.get 5
            i32.eq
            select
            i32.add
            local.get 2
            i32.store
            local.get 2
            i32.eqz
            br_if 1 (;@3;)
          end
          local.get 2
          local.get 7
          i32.store offset=24
          local.get 5
          i32.load offset=16
          local.tee 0
          if  ;; label = @4
            local.get 2
            local.get 0
            i32.store offset=16
            local.get 0
            local.get 2
            i32.store offset=24
          end
          local.get 5
          i32.load offset=20
          local.tee 0
          i32.eqz
          br_if 0 (;@3;)
          local.get 2
          local.get 0
          i32.store offset=20
          local.get 0
          local.get 2
          i32.store offset=24
        end
        block  ;; label = @3
          local.get 3
          i32.const 15
          i32.le_u
          if  ;; label = @4
            local.get 5
            local.get 3
            local.get 4
            i32.add
            local.tee 0
            i32.const 3
            i32.or
            i32.store offset=4
            local.get 0
            local.get 5
            i32.add
            local.tee 0
            local.get 0
            i32.load offset=4
            i32.const 1
            i32.or
            i32.store offset=4
            br 1 (;@3;)
          end
          local.get 5
          local.get 4
          i32.const 3
          i32.or
          i32.store offset=4
          local.get 4
          local.get 5
          i32.add
          local.tee 2
          local.get 3
          i32.const 1
          i32.or
          i32.store offset=4
          local.get 2
          local.get 3
          i32.add
          local.get 3
          i32.store
          local.get 3
          i32.const 255
          i32.le_u
          if  ;; label = @4
            local.get 3
            i32.const 3
            i32.shr_u
            local.tee 1
            i32.const 3
            i32.shl
            i32.const 1260
            i32.add
            local.set 0
            block (result i32)  ;; label = @5
              i32.const 1220
              i32.load
              local.tee 3
              i32.const 1
              local.get 1
              i32.shl
              local.tee 1
              i32.and
              i32.eqz
              if  ;; label = @6
                i32.const 1220
                local.get 1
                local.get 3
                i32.or
                i32.store
                local.get 0
                br 1 (;@5;)
              end
              local.get 0
              i32.load offset=8
            end
            local.set 1
            local.get 0
            local.get 2
            i32.store offset=8
            local.get 1
            local.get 2
            i32.store offset=12
            local.get 2
            local.get 0
            i32.store offset=12
            local.get 2
            local.get 1
            i32.store offset=8
            br 1 (;@3;)
          end
          local.get 2
          block (result i32)  ;; label = @4
            i32.const 0
            local.get 3
            i32.const 8
            i32.shr_u
            local.tee 1
            i32.eqz
            br_if 0 (;@4;)
            drop
            i32.const 31
            local.get 3
            i32.const 16777215
            i32.gt_u
            br_if 0 (;@4;)
            drop
            local.get 1
            local.get 1
            i32.const 1048320
            i32.add
            i32.const 16
            i32.shr_u
            i32.const 8
            i32.and
            local.tee 0
            i32.shl
            local.tee 1
            local.get 1
            i32.const 520192
            i32.add
            i32.const 16
            i32.shr_u
            i32.const 4
            i32.and
            local.tee 1
            i32.shl
            local.tee 4
            local.get 4
            i32.const 245760
            i32.add
            i32.const 16
            i32.shr_u
            i32.const 2
            i32.and
            local.tee 4
            i32.shl
            i32.const 15
            i32.shr_u
            local.get 0
            local.get 1
            i32.or
            local.get 4
            i32.or
            i32.sub
            local.tee 0
            i32.const 1
            i32.shl
            local.get 3
            local.get 0
            i32.const 21
            i32.add
            i32.shr_u
            i32.const 1
            i32.and
            i32.or
            i32.const 28
            i32.add
          end
          local.tee 0
          i32.store offset=28
          local.get 2
          i64.const 0
          i64.store offset=16 align=4
          local.get 0
          i32.const 2
          i32.shl
          i32.const 1524
          i32.add
          local.set 1
          block  ;; label = @4
            block  ;; label = @5
              local.get 8
              i32.const 1
              local.get 0
              i32.shl
              local.tee 4
              i32.and
              i32.eqz
              if  ;; label = @6
                i32.const 1224
                local.get 4
                local.get 8
                i32.or
                i32.store
                local.get 1
                local.get 2
                i32.store
                local.get 2
                local.get 1
                i32.store offset=24
                br 1 (;@5;)
              end
              local.get 3
              i32.const 0
              i32.const 25
              local.get 0
              i32.const 1
              i32.shr_u
              i32.sub
              local.get 0
              i32.const 31
              i32.eq
              select
              i32.shl
              local.set 0
              local.get 1
              i32.load
              local.set 4
              loop  ;; label = @6
                local.get 4
                local.tee 1
                i32.load offset=4
                i32.const -8
                i32.and
                local.get 3
                i32.eq
                br_if 2 (;@4;)
                local.get 0
                i32.const 29
                i32.shr_u
                local.set 4
                local.get 0
                i32.const 1
                i32.shl
                local.set 0
                local.get 1
                local.get 4
                i32.const 4
                i32.and
                i32.add
                i32.const 16
                i32.add
                local.tee 6
                i32.load
                local.tee 4
                br_if 0 (;@6;)
              end
              local.get 6
              local.get 2
              i32.store
              local.get 2
              local.get 1
              i32.store offset=24
            end
            local.get 2
            local.get 2
            i32.store offset=12
            local.get 2
            local.get 2
            i32.store offset=8
            br 1 (;@3;)
          end
          local.get 1
          i32.load offset=8
          local.tee 0
          local.get 2
          i32.store offset=12
          local.get 1
          local.get 2
          i32.store offset=8
          local.get 2
          i32.const 0
          i32.store offset=24
          local.get 2
          local.get 1
          i32.store offset=12
          local.get 2
          local.get 0
          i32.store offset=8
        end
        local.get 5
        i32.const 8
        i32.add
        local.set 0
        br 1 (;@1;)
      end
      block  ;; label = @2
        local.get 10
        i32.eqz
        br_if 0 (;@2;)
        block  ;; label = @3
          local.get 2
          i32.load offset=28
          local.tee 3
          i32.const 2
          i32.shl
          i32.const 1524
          i32.add
          local.tee 0
          i32.load
          local.get 2
          i32.eq
          if  ;; label = @4
            local.get 0
            local.get 5
            i32.store
            local.get 5
            br_if 1 (;@3;)
            i32.const 1224
            local.get 9
            i32.const -2
            local.get 3
            i32.rotl
            i32.and
            i32.store
            br 2 (;@2;)
          end
          local.get 10
          i32.const 16
          i32.const 20
          local.get 10
          i32.load offset=16
          local.get 2
          i32.eq
          select
          i32.add
          local.get 5
          i32.store
          local.get 5
          i32.eqz
          br_if 1 (;@2;)
        end
        local.get 5
        local.get 10
        i32.store offset=24
        local.get 2
        i32.load offset=16
        local.tee 0
        if  ;; label = @3
          local.get 5
          local.get 0
          i32.store offset=16
          local.get 0
          local.get 5
          i32.store offset=24
        end
        local.get 2
        i32.load offset=20
        local.tee 0
        i32.eqz
        br_if 0 (;@2;)
        local.get 5
        local.get 0
        i32.store offset=20
        local.get 0
        local.get 5
        i32.store offset=24
      end
      block  ;; label = @2
        local.get 1
        i32.const 15
        i32.le_u
        if  ;; label = @3
          local.get 2
          local.get 1
          local.get 4
          i32.add
          local.tee 0
          i32.const 3
          i32.or
          i32.store offset=4
          local.get 0
          local.get 2
          i32.add
          local.tee 0
          local.get 0
          i32.load offset=4
          i32.const 1
          i32.or
          i32.store offset=4
          br 1 (;@2;)
        end
        local.get 2
        local.get 4
        i32.const 3
        i32.or
        i32.store offset=4
        local.get 2
        local.get 4
        i32.add
        local.tee 3
        local.get 1
        i32.const 1
        i32.or
        i32.store offset=4
        local.get 1
        local.get 3
        i32.add
        local.get 1
        i32.store
        local.get 8
        if  ;; label = @3
          local.get 8
          i32.const 3
          i32.shr_u
          local.tee 5
          i32.const 3
          i32.shl
          i32.const 1260
          i32.add
          local.set 4
          i32.const 1240
          i32.load
          local.set 0
          block (result i32)  ;; label = @4
            i32.const 1
            local.get 5
            i32.shl
            local.tee 5
            local.get 6
            i32.and
            i32.eqz
            if  ;; label = @5
              i32.const 1220
              local.get 5
              local.get 6
              i32.or
              i32.store
              local.get 4
              br 1 (;@4;)
            end
            local.get 4
            i32.load offset=8
          end
          local.set 5
          local.get 4
          local.get 0
          i32.store offset=8
          local.get 5
          local.get 0
          i32.store offset=12
          local.get 0
          local.get 4
          i32.store offset=12
          local.get 0
          local.get 5
          i32.store offset=8
        end
        i32.const 1240
        local.get 3
        i32.store
        i32.const 1228
        local.get 1
        i32.store
      end
      local.get 2
      i32.const 8
      i32.add
      local.set 0
    end
    local.get 11
    i32.const 16
    i32.add
    global.set 0
    local.get 0)
  (func (;12;) (type 3) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      local.get 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const -8
      i32.add
      local.tee 2
      local.get 0
      i32.const -4
      i32.add
      i32.load
      local.tee 1
      i32.const -8
      i32.and
      local.tee 0
      i32.add
      local.set 5
      block  ;; label = @2
        local.get 1
        i32.const 1
        i32.and
        br_if 0 (;@2;)
        local.get 1
        i32.const 3
        i32.and
        i32.eqz
        br_if 1 (;@1;)
        local.get 2
        local.get 2
        i32.load
        local.tee 1
        i32.sub
        local.tee 2
        i32.const 1236
        i32.load
        local.tee 4
        i32.lt_u
        br_if 1 (;@1;)
        local.get 0
        local.get 1
        i32.add
        local.set 0
        local.get 2
        i32.const 1240
        i32.load
        i32.ne
        if  ;; label = @3
          local.get 1
          i32.const 255
          i32.le_u
          if  ;; label = @4
            local.get 2
            i32.load offset=8
            local.tee 7
            local.get 1
            i32.const 3
            i32.shr_u
            local.tee 6
            i32.const 3
            i32.shl
            i32.const 1260
            i32.add
            i32.ne
            drop
            local.get 7
            local.get 2
            i32.load offset=12
            local.tee 3
            i32.eq
            if  ;; label = @5
              i32.const 1220
              i32.const 1220
              i32.load
              i32.const -2
              local.get 6
              i32.rotl
              i32.and
              i32.store
              br 3 (;@2;)
            end
            local.get 7
            local.get 3
            i32.store offset=12
            local.get 3
            local.get 7
            i32.store offset=8
            br 2 (;@2;)
          end
          local.get 2
          i32.load offset=24
          local.set 6
          block  ;; label = @4
            local.get 2
            local.get 2
            i32.load offset=12
            local.tee 3
            i32.ne
            if  ;; label = @5
              local.get 4
              local.get 2
              i32.load offset=8
              local.tee 1
              i32.le_u
              if  ;; label = @6
                local.get 1
                i32.load offset=12
                drop
              end
              local.get 1
              local.get 3
              i32.store offset=12
              local.get 3
              local.get 1
              i32.store offset=8
              br 1 (;@4;)
            end
            block  ;; label = @5
              local.get 2
              i32.const 20
              i32.add
              local.tee 1
              i32.load
              local.tee 4
              br_if 0 (;@5;)
              local.get 2
              i32.const 16
              i32.add
              local.tee 1
              i32.load
              local.tee 4
              br_if 0 (;@5;)
              i32.const 0
              local.set 3
              br 1 (;@4;)
            end
            loop  ;; label = @5
              local.get 1
              local.set 7
              local.get 4
              local.tee 3
              i32.const 20
              i32.add
              local.tee 1
              i32.load
              local.tee 4
              br_if 0 (;@5;)
              local.get 3
              i32.const 16
              i32.add
              local.set 1
              local.get 3
              i32.load offset=16
              local.tee 4
              br_if 0 (;@5;)
            end
            local.get 7
            i32.const 0
            i32.store
          end
          local.get 6
          i32.eqz
          br_if 1 (;@2;)
          block  ;; label = @4
            local.get 2
            local.get 2
            i32.load offset=28
            local.tee 4
            i32.const 2
            i32.shl
            i32.const 1524
            i32.add
            local.tee 1
            i32.load
            i32.eq
            if  ;; label = @5
              local.get 1
              local.get 3
              i32.store
              local.get 3
              br_if 1 (;@4;)
              i32.const 1224
              i32.const 1224
              i32.load
              i32.const -2
              local.get 4
              i32.rotl
              i32.and
              i32.store
              br 3 (;@2;)
            end
            local.get 6
            i32.const 16
            i32.const 20
            local.get 6
            i32.load offset=16
            local.get 2
            i32.eq
            select
            i32.add
            local.get 3
            i32.store
            local.get 3
            i32.eqz
            br_if 2 (;@2;)
          end
          local.get 3
          local.get 6
          i32.store offset=24
          local.get 2
          i32.load offset=16
          local.tee 1
          if  ;; label = @4
            local.get 3
            local.get 1
            i32.store offset=16
            local.get 1
            local.get 3
            i32.store offset=24
          end
          local.get 2
          i32.load offset=20
          local.tee 1
          i32.eqz
          br_if 1 (;@2;)
          local.get 3
          local.get 1
          i32.store offset=20
          local.get 1
          local.get 3
          i32.store offset=24
          br 1 (;@2;)
        end
        local.get 5
        i32.load offset=4
        local.tee 1
        i32.const 3
        i32.and
        i32.const 3
        i32.ne
        br_if 0 (;@2;)
        i32.const 1228
        local.get 0
        i32.store
        local.get 5
        local.get 1
        i32.const -2
        i32.and
        i32.store offset=4
        local.get 2
        local.get 0
        i32.const 1
        i32.or
        i32.store offset=4
        local.get 0
        local.get 2
        i32.add
        local.get 0
        i32.store
        return
      end
      local.get 5
      local.get 2
      i32.le_u
      br_if 0 (;@1;)
      local.get 5
      i32.load offset=4
      local.tee 1
      i32.const 1
      i32.and
      i32.eqz
      br_if 0 (;@1;)
      block  ;; label = @2
        local.get 1
        i32.const 2
        i32.and
        i32.eqz
        if  ;; label = @3
          local.get 5
          i32.const 1244
          i32.load
          i32.eq
          if  ;; label = @4
            i32.const 1244
            local.get 2
            i32.store
            i32.const 1232
            i32.const 1232
            i32.load
            local.get 0
            i32.add
            local.tee 0
            i32.store
            local.get 2
            local.get 0
            i32.const 1
            i32.or
            i32.store offset=4
            local.get 2
            i32.const 1240
            i32.load
            i32.ne
            br_if 3 (;@1;)
            i32.const 1228
            i32.const 0
            i32.store
            i32.const 1240
            i32.const 0
            i32.store
            return
          end
          local.get 5
          i32.const 1240
          i32.load
          i32.eq
          if  ;; label = @4
            i32.const 1240
            local.get 2
            i32.store
            i32.const 1228
            i32.const 1228
            i32.load
            local.get 0
            i32.add
            local.tee 0
            i32.store
            local.get 2
            local.get 0
            i32.const 1
            i32.or
            i32.store offset=4
            local.get 0
            local.get 2
            i32.add
            local.get 0
            i32.store
            return
          end
          local.get 1
          i32.const -8
          i32.and
          local.get 0
          i32.add
          local.set 0
          block  ;; label = @4
            local.get 1
            i32.const 255
            i32.le_u
            if  ;; label = @5
              local.get 5
              i32.load offset=12
              local.set 4
              local.get 5
              i32.load offset=8
              local.tee 3
              local.get 1
              i32.const 3
              i32.shr_u
              local.tee 5
              i32.const 3
              i32.shl
              i32.const 1260
              i32.add
              local.tee 1
              i32.ne
              if  ;; label = @6
                i32.const 1236
                i32.load
                drop
              end
              local.get 3
              local.get 4
              i32.eq
              if  ;; label = @6
                i32.const 1220
                i32.const 1220
                i32.load
                i32.const -2
                local.get 5
                i32.rotl
                i32.and
                i32.store
                br 2 (;@4;)
              end
              local.get 1
              local.get 4
              i32.ne
              if  ;; label = @6
                i32.const 1236
                i32.load
                drop
              end
              local.get 3
              local.get 4
              i32.store offset=12
              local.get 4
              local.get 3
              i32.store offset=8
              br 1 (;@4;)
            end
            local.get 5
            i32.load offset=24
            local.set 6
            block  ;; label = @5
              local.get 5
              local.get 5
              i32.load offset=12
              local.tee 3
              i32.ne
              if  ;; label = @6
                i32.const 1236
                i32.load
                local.get 5
                i32.load offset=8
                local.tee 1
                i32.le_u
                if  ;; label = @7
                  local.get 1
                  i32.load offset=12
                  drop
                end
                local.get 1
                local.get 3
                i32.store offset=12
                local.get 3
                local.get 1
                i32.store offset=8
                br 1 (;@5;)
              end
              block  ;; label = @6
                local.get 5
                i32.const 20
                i32.add
                local.tee 1
                i32.load
                local.tee 4
                br_if 0 (;@6;)
                local.get 5
                i32.const 16
                i32.add
                local.tee 1
                i32.load
                local.tee 4
                br_if 0 (;@6;)
                i32.const 0
                local.set 3
                br 1 (;@5;)
              end
              loop  ;; label = @6
                local.get 1
                local.set 7
                local.get 4
                local.tee 3
                i32.const 20
                i32.add
                local.tee 1
                i32.load
                local.tee 4
                br_if 0 (;@6;)
                local.get 3
                i32.const 16
                i32.add
                local.set 1
                local.get 3
                i32.load offset=16
                local.tee 4
                br_if 0 (;@6;)
              end
              local.get 7
              i32.const 0
              i32.store
            end
            local.get 6
            i32.eqz
            br_if 0 (;@4;)
            block  ;; label = @5
              local.get 5
              local.get 5
              i32.load offset=28
              local.tee 4
              i32.const 2
              i32.shl
              i32.const 1524
              i32.add
              local.tee 1
              i32.load
              i32.eq
              if  ;; label = @6
                local.get 1
                local.get 3
                i32.store
                local.get 3
                br_if 1 (;@5;)
                i32.const 1224
                i32.const 1224
                i32.load
                i32.const -2
                local.get 4
                i32.rotl
                i32.and
                i32.store
                br 2 (;@4;)
              end
              local.get 6
              i32.const 16
              i32.const 20
              local.get 6
              i32.load offset=16
              local.get 5
              i32.eq
              select
              i32.add
              local.get 3
              i32.store
              local.get 3
              i32.eqz
              br_if 1 (;@4;)
            end
            local.get 3
            local.get 6
            i32.store offset=24
            local.get 5
            i32.load offset=16
            local.tee 1
            if  ;; label = @5
              local.get 3
              local.get 1
              i32.store offset=16
              local.get 1
              local.get 3
              i32.store offset=24
            end
            local.get 5
            i32.load offset=20
            local.tee 1
            i32.eqz
            br_if 0 (;@4;)
            local.get 3
            local.get 1
            i32.store offset=20
            local.get 1
            local.get 3
            i32.store offset=24
          end
          local.get 2
          local.get 0
          i32.const 1
          i32.or
          i32.store offset=4
          local.get 0
          local.get 2
          i32.add
          local.get 0
          i32.store
          local.get 2
          i32.const 1240
          i32.load
          i32.ne
          br_if 1 (;@2;)
          i32.const 1228
          local.get 0
          i32.store
          return
        end
        local.get 5
        local.get 1
        i32.const -2
        i32.and
        i32.store offset=4
        local.get 2
        local.get 0
        i32.const 1
        i32.or
        i32.store offset=4
        local.get 0
        local.get 2
        i32.add
        local.get 0
        i32.store
      end
      local.get 0
      i32.const 255
      i32.le_u
      if  ;; label = @2
        local.get 0
        i32.const 3
        i32.shr_u
        local.tee 1
        i32.const 3
        i32.shl
        i32.const 1260
        i32.add
        local.set 0
        block (result i32)  ;; label = @3
          i32.const 1220
          i32.load
          local.tee 4
          i32.const 1
          local.get 1
          i32.shl
          local.tee 1
          i32.and
          i32.eqz
          if  ;; label = @4
            i32.const 1220
            local.get 1
            local.get 4
            i32.or
            i32.store
            local.get 0
            br 1 (;@3;)
          end
          local.get 0
          i32.load offset=8
        end
        local.set 1
        local.get 0
        local.get 2
        i32.store offset=8
        local.get 1
        local.get 2
        i32.store offset=12
        local.get 2
        local.get 0
        i32.store offset=12
        local.get 2
        local.get 1
        i32.store offset=8
        return
      end
      local.get 2
      i64.const 0
      i64.store offset=16 align=4
      local.get 2
      block (result i32)  ;; label = @2
        i32.const 0
        local.get 0
        i32.const 8
        i32.shr_u
        local.tee 4
        i32.eqz
        br_if 0 (;@2;)
        drop
        i32.const 31
        local.get 0
        i32.const 16777215
        i32.gt_u
        br_if 0 (;@2;)
        drop
        local.get 4
        local.get 4
        i32.const 1048320
        i32.add
        i32.const 16
        i32.shr_u
        i32.const 8
        i32.and
        local.tee 1
        i32.shl
        local.tee 4
        local.get 4
        i32.const 520192
        i32.add
        i32.const 16
        i32.shr_u
        i32.const 4
        i32.and
        local.tee 4
        i32.shl
        local.tee 3
        local.get 3
        i32.const 245760
        i32.add
        i32.const 16
        i32.shr_u
        i32.const 2
        i32.and
        local.tee 3
        i32.shl
        i32.const 15
        i32.shr_u
        local.get 1
        local.get 4
        i32.or
        local.get 3
        i32.or
        i32.sub
        local.tee 1
        i32.const 1
        i32.shl
        local.get 0
        local.get 1
        i32.const 21
        i32.add
        i32.shr_u
        i32.const 1
        i32.and
        i32.or
        i32.const 28
        i32.add
      end
      local.tee 1
      i32.store offset=28
      local.get 1
      i32.const 2
      i32.shl
      i32.const 1524
      i32.add
      local.set 4
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            i32.const 1224
            i32.load
            local.tee 3
            i32.const 1
            local.get 1
            i32.shl
            local.tee 5
            i32.and
            i32.eqz
            if  ;; label = @5
              i32.const 1224
              local.get 3
              local.get 5
              i32.or
              i32.store
              local.get 4
              local.get 2
              i32.store
              local.get 2
              local.get 4
              i32.store offset=24
              br 1 (;@4;)
            end
            local.get 0
            i32.const 0
            i32.const 25
            local.get 1
            i32.const 1
            i32.shr_u
            i32.sub
            local.get 1
            i32.const 31
            i32.eq
            select
            i32.shl
            local.set 1
            local.get 4
            i32.load
            local.set 3
            loop  ;; label = @5
              local.get 3
              local.tee 4
              i32.load offset=4
              i32.const -8
              i32.and
              local.get 0
              i32.eq
              br_if 2 (;@3;)
              local.get 1
              i32.const 29
              i32.shr_u
              local.set 3
              local.get 1
              i32.const 1
              i32.shl
              local.set 1
              local.get 4
              local.get 3
              i32.const 4
              i32.and
              i32.add
              i32.const 16
              i32.add
              local.tee 5
              i32.load
              local.tee 3
              br_if 0 (;@5;)
            end
            local.get 5
            local.get 2
            i32.store
            local.get 2
            local.get 4
            i32.store offset=24
          end
          local.get 2
          local.get 2
          i32.store offset=12
          local.get 2
          local.get 2
          i32.store offset=8
          br 1 (;@2;)
        end
        local.get 4
        i32.load offset=8
        local.tee 0
        local.get 2
        i32.store offset=12
        local.get 4
        local.get 2
        i32.store offset=8
        local.get 2
        i32.const 0
        i32.store offset=24
        local.get 2
        local.get 4
        i32.store offset=12
        local.get 2
        local.get 0
        i32.store offset=8
      end
      i32.const 1252
      i32.const 1252
      i32.load
      i32.const -1
      i32.add
      local.tee 2
      i32.store
      local.get 2
      br_if 0 (;@1;)
      i32.const 1676
      local.set 2
      loop  ;; label = @2
        local.get 2
        i32.load
        local.tee 0
        i32.const 8
        i32.add
        local.set 2
        local.get 0
        br_if 0 (;@2;)
      end
      i32.const 1252
      i32.const -1
      i32.store
    end)
  (func (;13;) (type 0) (param i32) (result i32)
    (local i32 i32)
    i32.const 1728
    i32.load
    local.tee 1
    local.get 0
    i32.const 3
    i32.add
    i32.const -4
    i32.and
    local.tee 2
    i32.add
    local.set 0
    block  ;; label = @1
      local.get 2
      i32.const 1
      i32.ge_s
      i32.const 0
      local.get 0
      local.get 1
      i32.le_u
      select
      br_if 0 (;@1;)
      local.get 0
      memory.size
      i32.const 16
      i32.shl
      i32.gt_u
      if  ;; label = @2
        local.get 0
        call 0
        i32.eqz
        br_if 1 (;@1;)
      end
      i32.const 1728
      local.get 0
      i32.store
      local.get 1
      return
    end
    i32.const 1216
    i32.const 48
    i32.store
    i32.const -1)
  (func (;14;) (type 2) (param i32 i32 i32) (result i32)
    (local i32 i32 i32)
    local.get 2
    i32.const 512
    i32.ge_u
    if  ;; label = @1
      local.get 0
      local.get 1
      local.get 2
      call 1
      drop
      local.get 0
      return
    end
    local.get 0
    local.get 2
    i32.add
    local.set 3
    block  ;; label = @1
      local.get 0
      local.get 1
      i32.xor
      i32.const 3
      i32.and
      i32.eqz
      if  ;; label = @2
        block  ;; label = @3
          local.get 2
          i32.const 1
          i32.lt_s
          if  ;; label = @4
            local.get 0
            local.set 2
            br 1 (;@3;)
          end
          local.get 0
          i32.const 3
          i32.and
          i32.eqz
          if  ;; label = @4
            local.get 0
            local.set 2
            br 1 (;@3;)
          end
          local.get 0
          local.set 2
          loop  ;; label = @4
            local.get 2
            local.get 1
            i32.load8_u
            i32.store8
            local.get 1
            i32.const 1
            i32.add
            local.set 1
            local.get 2
            i32.const 1
            i32.add
            local.tee 2
            local.get 3
            i32.ge_u
            br_if 1 (;@3;)
            local.get 2
            i32.const 3
            i32.and
            br_if 0 (;@4;)
          end
        end
        block  ;; label = @3
          local.get 3
          i32.const -4
          i32.and
          local.tee 4
          i32.const 64
          i32.lt_u
          br_if 0 (;@3;)
          local.get 2
          local.get 4
          i32.const -64
          i32.add
          local.tee 5
          i32.gt_u
          br_if 0 (;@3;)
          loop  ;; label = @4
            local.get 2
            local.get 1
            i32.load
            i32.store
            local.get 2
            local.get 1
            i32.load offset=4
            i32.store offset=4
            local.get 2
            local.get 1
            i32.load offset=8
            i32.store offset=8
            local.get 2
            local.get 1
            i32.load offset=12
            i32.store offset=12
            local.get 2
            local.get 1
            i32.load offset=16
            i32.store offset=16
            local.get 2
            local.get 1
            i32.load offset=20
            i32.store offset=20
            local.get 2
            local.get 1
            i32.load offset=24
            i32.store offset=24
            local.get 2
            local.get 1
            i32.load offset=28
            i32.store offset=28
            local.get 2
            local.get 1
            i32.load offset=32
            i32.store offset=32
            local.get 2
            local.get 1
            i32.load offset=36
            i32.store offset=36
            local.get 2
            local.get 1
            i32.load offset=40
            i32.store offset=40
            local.get 2
            local.get 1
            i32.load offset=44
            i32.store offset=44
            local.get 2
            local.get 1
            i32.load offset=48
            i32.store offset=48
            local.get 2
            local.get 1
            i32.load offset=52
            i32.store offset=52
            local.get 2
            local.get 1
            i32.load offset=56
            i32.store offset=56
            local.get 2
            local.get 1
            i32.load offset=60
            i32.store offset=60
            local.get 1
            i32.const -64
            i32.sub
            local.set 1
            local.get 2
            i32.const -64
            i32.sub
            local.tee 2
            local.get 5
            i32.le_u
            br_if 0 (;@4;)
          end
        end
        local.get 2
        local.get 4
        i32.ge_u
        br_if 1 (;@1;)
        loop  ;; label = @3
          local.get 2
          local.get 1
          i32.load
          i32.store
          local.get 1
          i32.const 4
          i32.add
          local.set 1
          local.get 2
          i32.const 4
          i32.add
          local.tee 2
          local.get 4
          i32.lt_u
          br_if 0 (;@3;)
        end
        br 1 (;@1;)
      end
      local.get 3
      i32.const 4
      i32.lt_u
      if  ;; label = @2
        local.get 0
        local.set 2
        br 1 (;@1;)
      end
      local.get 3
      i32.const -4
      i32.add
      local.tee 4
      local.get 0
      i32.lt_u
      if  ;; label = @2
        local.get 0
        local.set 2
        br 1 (;@1;)
      end
      local.get 0
      local.set 2
      loop  ;; label = @2
        local.get 2
        local.get 1
        i32.load8_u
        i32.store8
        local.get 2
        local.get 1
        i32.load8_u offset=1
        i32.store8 offset=1
        local.get 2
        local.get 1
        i32.load8_u offset=2
        i32.store8 offset=2
        local.get 2
        local.get 1
        i32.load8_u offset=3
        i32.store8 offset=3
        local.get 1
        i32.const 4
        i32.add
        local.set 1
        local.get 2
        i32.const 4
        i32.add
        local.tee 2
        local.get 4
        i32.le_u
        br_if 0 (;@2;)
      end
    end
    local.get 2
    local.get 3
    i32.lt_u
    if  ;; label = @1
      loop  ;; label = @2
        local.get 2
        local.get 1
        i32.load8_u
        i32.store8
        local.get 1
        i32.const 1
        i32.add
        local.set 1
        local.get 2
        i32.const 1
        i32.add
        local.tee 2
        local.get 3
        i32.ne
        br_if 0 (;@2;)
      end
    end
    local.get 0)
  (func (;15;) (type 2) (param i32 i32 i32) (result i32)
    (local i32 i32 i64)
    block  ;; label = @1
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      local.get 2
      i32.add
      local.tee 3
      i32.const -1
      i32.add
      local.get 1
      i32.store8
      local.get 0
      local.get 1
      i32.store8
      local.get 2
      i32.const 3
      i32.lt_u
      br_if 0 (;@1;)
      local.get 3
      i32.const -2
      i32.add
      local.get 1
      i32.store8
      local.get 0
      local.get 1
      i32.store8 offset=1
      local.get 3
      i32.const -3
      i32.add
      local.get 1
      i32.store8
      local.get 0
      local.get 1
      i32.store8 offset=2
      local.get 2
      i32.const 7
      i32.lt_u
      br_if 0 (;@1;)
      local.get 3
      i32.const -4
      i32.add
      local.get 1
      i32.store8
      local.get 0
      local.get 1
      i32.store8 offset=3
      local.get 2
      i32.const 9
      i32.lt_u
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      local.get 0
      i32.sub
      i32.const 3
      i32.and
      local.tee 4
      i32.add
      local.tee 3
      local.get 1
      i32.const 255
      i32.and
      i32.const 16843009
      i32.mul
      local.tee 1
      i32.store
      local.get 3
      local.get 2
      local.get 4
      i32.sub
      i32.const -4
      i32.and
      local.tee 4
      i32.add
      local.tee 2
      i32.const -4
      i32.add
      local.get 1
      i32.store
      local.get 4
      i32.const 9
      i32.lt_u
      br_if 0 (;@1;)
      local.get 3
      local.get 1
      i32.store offset=8
      local.get 3
      local.get 1
      i32.store offset=4
      local.get 2
      i32.const -8
      i32.add
      local.get 1
      i32.store
      local.get 2
      i32.const -12
      i32.add
      local.get 1
      i32.store
      local.get 4
      i32.const 25
      i32.lt_u
      br_if 0 (;@1;)
      local.get 3
      local.get 1
      i32.store offset=24
      local.get 3
      local.get 1
      i32.store offset=20
      local.get 3
      local.get 1
      i32.store offset=16
      local.get 3
      local.get 1
      i32.store offset=12
      local.get 2
      i32.const -16
      i32.add
      local.get 1
      i32.store
      local.get 2
      i32.const -20
      i32.add
      local.get 1
      i32.store
      local.get 2
      i32.const -24
      i32.add
      local.get 1
      i32.store
      local.get 2
      i32.const -28
      i32.add
      local.get 1
      i32.store
      local.get 4
      local.get 3
      i32.const 4
      i32.and
      i32.const 24
      i32.or
      local.tee 4
      i32.sub
      local.tee 2
      i32.const 32
      i32.lt_u
      br_if 0 (;@1;)
      local.get 1
      i64.extend_i32_u
      local.tee 5
      i64.const 32
      i64.shl
      local.get 5
      i64.or
      local.set 5
      local.get 3
      local.get 4
      i32.add
      local.set 1
      loop  ;; label = @2
        local.get 1
        local.get 5
        i64.store offset=24
        local.get 1
        local.get 5
        i64.store offset=16
        local.get 1
        local.get 5
        i64.store offset=8
        local.get 1
        local.get 5
        i64.store
        local.get 1
        i32.const 32
        i32.add
        local.set 1
        local.get 2
        i32.const -32
        i32.add
        local.tee 2
        i32.const 31
        i32.gt_u
        br_if 0 (;@2;)
      end
    end
    local.get 0)
  (func (;16;) (type 1) (result i32)
    global.get 0)
  (func (;17;) (type 3) (param i32)
    local.get 0
    global.set 0)
  (func (;18;) (type 0) (param i32) (result i32)
    global.get 0
    local.get 0
    i32.sub
    i32.const -16
    i32.and
    local.tee 0
    global.set 0
    local.get 0)
  (func (;19;) (type 0) (param i32) (result i32)
    local.get 0
    memory.grow)
  (global (;0;) (mut i32) (i32.const 67424))
  (global (;1;) i32 (i32.const 1716))
  (export "__wasm_call_ctors" (func 2))
  (export "keccak_ctx_sizeof" (func 3))
  (export "keccak_alloc" (func 4))
  (export "malloc" (func 11))
  (export "keccak_init" (func 5))
  (export "memset" (func 15))
  (export "keccak_update" (func 6))
  (export "memcpy" (func 14))
  (export "keccak_final" (func 8))
  (export "keccak_digest" (func 9))
  (export "__errno_location" (func 10))
  (export "stackSave" (func 16))
  (export "stackRestore" (func 17))
  (export "stackAlloc" (func 18))
  (export "free" (func 12))
  (export "__data_end" (global 1))
  (export "__growWasmMemory" (func 19))
  (data (;0;) (i32.const 1024) "\01\00\00\00\00\00\00\00\82\80\00\00\00\00\00\00\8a\80\00\00\00\00\00\80\00\80\00\80\00\00\00\80\8b\80\00\00\00\00\00\00\01\00\00\80\00\00\00\00\81\80\00\80\00\00\00\80\09\80\00\00\00\00\00\80\8a\00\00\00\00\00\00\00\88\00\00\00\00\00\00\00\09\80\00\80\00\00\00\00\0a\00\00\80\00\00\00\00\8b\80\00\80\00\00\00\00\8b\00\00\00\00\00\00\80\89\80\00\00\00\00\00\80\03\80\00\00\00\00\00\80\02\80\00\00\00\00\00\80\80\00\00\00\00\00\00\80\0a\80\00\00\00\00\00\00\0a\00\00\80\00\00\00\80\81\80\00\80\00\00\00\80\80\80\00\00\00\00\00\80\01\00\00\80\00\00\00\00\08\80\00\80\00\00\00\80"))
